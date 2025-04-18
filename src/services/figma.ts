import fs from "fs";
import https from "https"; // Import the https module
import axios, { AxiosError } from "axios";
import { parseFigmaResponse, SimplifiedDesign } from "./simplify-node-response.js";
import type {
  GetImagesResponse,
  GetFileResponse,
  GetFileNodesResponse,
  GetImageFillsResponse,
} from "@figma/rest-api-spec";
import { downloadFigmaImage } from "~/utils/common.js";
import { Logger } from "~/server.js";
import yaml from "js-yaml";

export interface FigmaError {
  status: number;
  err: string;
}

type FetchImageParams = {
  /**
   * The Node in Figma that will either be rendered or have its background image downloaded
   */
  nodeId: string;
  /**
   * The local file name to save the image
   */
  fileName: string;
  /**
   * The file mimetype for the image
   */
  fileType: "png" | "svg";
};

type FetchImageFillParams = Omit<FetchImageParams, "fileType"> & {
  /**
   * Required to grab the background image when an image is used as a fill
   */
  imageRef: string;
};

export class FigmaService {
  private readonly apiKey: string;
  private readonly baseUrl = "https://api.figma.com/v1";

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  private async request<T>(endpoint: string): Promise<T> {
    console.log('REQUESTING FIGMA API WITH AXIOS');

    // Read the Netskope certificate bundle inside the request method
    const netskopeCertPath = "/Library/Application Support/Netskope/STAgent/data/netskope-cert-bundle.pem";
    let netskopeCa: Buffer | undefined;
    try {
      netskopeCa = fs.readFileSync(netskopeCertPath);
      Logger.log(`Successfully loaded Netskope certificate from ${netskopeCertPath}`);
    } catch (err) {
      Logger.error(`Error reading Netskope certificate file at ${netskopeCertPath}:`, err);
      // Log the error and proceed without the custom CA.
      // Consider adding a more robust error handling strategy here.
    }

    try {
      Logger.log(`Calling ${this.baseUrl}${endpoint}`);
      const response = await axios.get<T>(`${this.baseUrl}${endpoint}`, {
        headers: {
          "X-Figma-Token": this.apiKey,
          "Accept-Encoding": "gzip, deflate, br", // Common practice for axios
        },
        // Configure httpsAgent to trust the Netskope CA bundle
        httpsAgent: new https.Agent({
          ca: netskopeCa, // Use the loaded certificate bundle
          // rejectUnauthorized is true by default, no need to set it explicitly
        }),
        // Consider adding proxy/agent configuration here if needed for Netskope
        // httpsAgent: new HttpsProxyAgent(process.env.HTTPS_PROXY, { ca: netskopeCa }), // Example with proxy agent + CA
        // proxy: false, // If proxy needs to be explicitly disabled
      });

      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError;
      if (axiosError.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error("Figma API Error Status:", axiosError.response.status);
        console.error("Figma API Error Data:", axiosError.response.data);
        throw {
          status: axiosError.response.status,
          err: axiosError.response.statusText || JSON.stringify(axiosError.response.data) || "Unknown API error",
        } as FigmaError;
      } else if (axiosError.request) {
        // The request was made but no response was received
        console.error("Figma API No Response:", axiosError.request);
        throw new Error(`Failed to make request to Figma API: No response received. ${axiosError.message}`);
      } else {
        // Something happened in setting up the request that triggered an Error
        console.error("Figma API Request Setup Error:", axiosError.message);
        throw new Error(`Failed to make request to Figma API: ${axiosError.message}`);
      }
      // Fallback generic error
      // throw new Error(`Failed to make request to Figma API: ${error}`);
    }
  }

  async getImageFills(
    fileKey: string,
    nodes: FetchImageFillParams[],
    localPath: string,
  ): Promise<string[]> {
    if (nodes.length === 0) return [];

    let promises: Promise<string>[] = [];
    const endpoint = `/files/${fileKey}/images`;
    const file = await this.request<GetImageFillsResponse>(endpoint);
    const { images = {} } = file.meta;
    promises = nodes.map(async ({ imageRef, fileName }) => {
      const imageUrl = images[imageRef];
      if (!imageUrl) {
        return "";
      }
      return downloadFigmaImage(fileName, localPath, imageUrl);
    });
    return Promise.all(promises);
  }

  async getImages(
    fileKey: string,
    nodes: FetchImageParams[],
    localPath: string,
  ): Promise<string[]> {
    const pngIds = nodes.filter(({ fileType }) => fileType === "png").map(({ nodeId }) => nodeId);
    const pngFiles =
      pngIds.length > 0
        ? this.request<GetImagesResponse>(
            `/images/${fileKey}?ids=${pngIds.join(",")}&scale=2&format=png`,
          ).then(({ images = {} }) => images)
        : ({} as GetImagesResponse["images"]);

    const svgIds = nodes.filter(({ fileType }) => fileType === "svg").map(({ nodeId }) => nodeId);
    const svgFiles =
      svgIds.length > 0
        ? this.request<GetImagesResponse>(
            `/images/${fileKey}?ids=${svgIds.join(",")}&scale=2&format=svg`,
          ).then(({ images = {} }) => images)
        : ({} as GetImagesResponse["images"]);

    const files = await Promise.all([pngFiles, svgFiles]).then(([f, l]) => ({ ...f, ...l }));

    const downloads = nodes
      .map(({ nodeId, fileName }) => {
        const imageUrl = files[nodeId];
        if (imageUrl) {
          return downloadFigmaImage(fileName, localPath, imageUrl);
        }
        return false;
      })
      .filter((url) => !!url);

    return Promise.all(downloads);
  }

  async getFile(fileKey: string, depth?: number): Promise<SimplifiedDesign> {
    try {
      const endpoint = `/files/${fileKey}${depth ? `?depth=${depth}` : ""}`;
      Logger.log(`Retrieving Figma file: ${fileKey} (depth: ${depth ?? "default"})`);
      const response = await this.request<GetFileResponse>(endpoint);
      Logger.log("Got response");
      const simplifiedResponse = parseFigmaResponse(response);
      writeLogs("figma-raw.yml", response);
      writeLogs("figma-simplified.yml", simplifiedResponse);
      return simplifiedResponse;
    } catch (e) {
      console.error("Failed to get file:", e);
      throw e;
    }
  }

  async getNode(fileKey: string, nodeId: string, depth?: number): Promise<SimplifiedDesign> {
    const endpoint = `/files/${fileKey}/nodes?ids=${nodeId}${depth ? `&depth=${depth}` : ""}`;
    const response = await this.request<GetFileNodesResponse>(endpoint);
    Logger.log("Got response from getNode, now parsing.");
    writeLogs("figma-raw.yml", response);
    const simplifiedResponse = parseFigmaResponse(response);
    writeLogs("figma-simplified.yml", simplifiedResponse);
    return simplifiedResponse;
  }
}

function writeLogs(name: string, value: any) {
  try {
    if (process.env.NODE_ENV !== "development") return;

    const logsDir = "logs";

    try {
      fs.accessSync(process.cwd(), fs.constants.W_OK);
    } catch (error) {
      Logger.log("Failed to write logs:", error);
      return;
    }

    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir);
    }
    fs.writeFileSync(`${logsDir}/${name}`, yaml.dump(value));
  } catch (error) {
    console.debug("Failed to write logs:", error);
  }
}
