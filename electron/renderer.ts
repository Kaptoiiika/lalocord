import "../src/index"
import { getDisplayMedia } from "./renderer/index"

navigator.mediaDevices.getDisplayMedia = getDisplayMedia
