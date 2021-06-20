import { Earthquake } from "./Earthquake";

export interface USGSResponse {
  type: string,
  metadata: {
    generated: number,
    url: string,
    title: string,
    status: number,
    api: string,
    count: number
  },
  features: Earthquake[],
  bbox: number[]
}