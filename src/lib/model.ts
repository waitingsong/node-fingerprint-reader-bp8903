import {
  DModel as M,
  FModel as FM,
} from 'win32-def'


export interface Config {
    /** base directory of this module */
  appDir: string
}

export declare type Options = Partial<DeviceOpts>
export interface DeviceOpts {
  dllTxt: string
  dllSearchPath?: string
  /** Default: false */
  debug: boolean
  /** 指定设备端口 默认0自动搜索 */
  port: number
  searchAll: boolean
}

/** 设备配置参数 */
export interface DeviceBase {
  apib: FM.DllFuncsModel
  deviceOpts: DeviceOpts
  /** device in use */
  inUse: boolean
  openPort: number
}

/* sdtapi.dll 接口方法类型 */
interface FuncsModel extends FM.DllFuncsModel {
  /** 校验 */
  ABC_Match(
    pFingerFeature: M.POINT,
    pFingerTemplate: M.POINT,
  ): M.INT
  /** 单次采集 */
  ABC_GetFeature(iCom: M.BYTE, pBuf: M.POINT, iBufLen: M.INT): M.INT
  /** 三次采集 */
  ABC_GetTemplate(iCom: M.BYTE, pBuf: M.POINT, iBufLen: M.INT): M.INT
}
export type DllFuncsModel = FM.ExpandFnModel<FuncsModel>

/** 读卡设置 */
export interface Device extends DeviceBase {
  apib: DllFuncsModel
}

/**
 * 采样次数
 * simple: 1 time
 * strict: 3 times
 */
export type SampleMode = 'simple' | 'strict'
