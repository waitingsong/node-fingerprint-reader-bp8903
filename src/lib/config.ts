import {
  DTypes as W,
  FModel as FM,
} from 'win32-def'

import {
  Config, DeviceOpts,
} from './model'


export const config: Config = {
  appDir: '',  // update by entry point index.js
}

/** 初始化参数 */
export const initialOpts: DeviceOpts = {
  dllTxt: '',
  dllSearchPath: '',
  debug: false,
  port: 0,
  searchAll: false,
}


export const dllFuncs: FM.DllFuncs = {
  ABC_GetFeature: [W.INT, [W.BYTE, W.POINT, W.INT] ],
  ABC_GetTemplate: [W.INT, [W.BYTE, W.POINT, W.INT] ],
  ABC_Match: [W.INT, [W.POINT, W.POINT] ],
}
