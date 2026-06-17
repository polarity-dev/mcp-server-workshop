import { AuthInfo } from "@modelcontextprotocol/server"
import { AuthExtra } from "@/utils/types"

declare module "http" {
  interface IncomingMessage {
    auth?: AuthInfo & { extra?: AuthExtra }
  }
}
