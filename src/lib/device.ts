import { info } from '@waiting/log'

import {
  Device,
} from './model'


export function findDeviceList(
  deviceOpts: Device['deviceOpts'],
  apib: Device['apib'],
): Device[] {
  const arr: Device[] = []

  if (deviceOpts.port > 0) {
    const device = findDevice(deviceOpts.port, deviceOpts, apib)
    if (device.openPort > 0) {
      arr.push(device)
    }
  }
  else {
    throw new Error('deviceOpts.port must be specified')
  }

  return arr
}


export function findDevice(
  port: Device['deviceOpts']['port'],
  deviceOpts: Device['deviceOpts'],
  apib: Device['apib'],
): Device {

  const device: Device = {
    apib,
    deviceOpts,
    inUse: false,
    openPort: port,
  }

  return device
}


/** Sampling fingerprint once, return base64 */
export function readOnce(device: Device, bufLen: number = 1024): Buffer {
  device.deviceOpts.debug && info('staring read once...')

  const buf = Buffer.alloc(bufLen)
  const code = device.apib.ABC_GetFeature(
    device.openPort,
    buf,
    bufLen,
  )
  const ret = code === 1
    ? buf
    : Buffer.alloc(0)

  if (device.deviceOpts.debug) {
    info(`Fingerprint readOnce code: ${code}. 1:succeed, 0/others:failed`)
  }

  return ret
}

/** Sampling fingerprint 3times, return base64 */
export function readThrice(device: Device, bufLen: number = 1024): Buffer {
  device.deviceOpts.debug && info('staring read thrice...')

  const buf = Buffer.alloc(bufLen)
  const code = device.apib.ABC_GetTemplate(
    device.openPort,
    buf,
    bufLen,
  )
  const ret = code === 1
    ? buf
    : Buffer.alloc(0)

  if (device.deviceOpts.debug) {
    info(`Fingerprint readThice code: ${code}. 1:succeed, 0/others:failed`)
  }

  return ret
}


export function compareFP(device: Device, fp1: Buffer, fp2: Buffer): Promise<boolean > {
  return new Promise(resolve => {
    // const code = device.apib.ABC_Match(fp1, fp2)
    device.apib.ABC_Match.async(fp1, fp2, (err: Error, code: number) => {
      resolve(code === 1 ? true : false)
      return code
    })
  })
}
