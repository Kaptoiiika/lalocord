import "../src/index"
import { getDisplayMedia } from "./renderer/getDisplayMedia/getDisplayMedia"

navigator.mediaDevices.getDisplayMedia = getDisplayMedia
