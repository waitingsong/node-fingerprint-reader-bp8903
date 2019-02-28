import { info } from '@waiting/log'
import {
  normalize, validateDllFile,
} from '@waiting/shared-core'
import * as ffi from 'ffi'
import { forkJoin, of } from 'rxjs'
import { mergeMap, retry, tap } from 'rxjs/operators'

import {
  dllFuncs, initialOpts,
} from './config'
import { compareFP, findDeviceList, readOnce, readThrice } from './device'
import { Device, DeviceOpts, Options } from './model'


export async function init(options: Options): Promise<Device[]> {
  const deviceOpts = parseDeviceOpts(options)

  const { debug } = deviceOpts

  if (debug) {
    info(deviceOpts)
  }

  await validateDllFile(deviceOpts.dllTxt)
  const apib = ffi.Library(deviceOpts.dllTxt, dllFuncs)
  const devices = findDeviceList(deviceOpts, apib)

  if (devices && devices.length) {
    return devices
  }
  else {
    throw new Error('未找到读卡设备')
  }
}


/**
 * Sample fingprint
 *
 * mode (default: strict):
 *  - simple: read once
 *  - strict: read 3 times
 */
export function sampleFP(
  device: Device,
  mode: 'simple' | 'strict' = 'strict',
): Promise<string> {

  const buf = mode === 'simple' ? readOnce(device) : readThrice(device)
  const ret = parseResultBuffer(buf)
  return Promise.resolve(ret)
}


export function validateFP(device: Device, fp: string): Promise<boolean> {
  const fp1$ = of(readOnce(device)).pipe(
    tap(buf => {
      if (! buf.byteLength) {
        throw new Error('Sampling result empty. will retry once')
      }
    }),
    retry(1),
    tap(buf => {
      if (! buf.byteLength) {
        throw new Error('Sampling result empty')
      }
    }),
  )

  const fp2$ = of(Buffer.from(fp)).pipe(
    tap(buf => {
      if (! buf.byteLength) {
        throw new Error('Input fingerprint key being validated is invalid')
      }
    }),
  )

  const ret$ = forkJoin(fp1$, fp2$).pipe(
    mergeMap(([fp1, fp2]) => compareFP(device, fp1, fp2)),
  )

  return ret$.toPromise()
}


function parseDeviceOpts(options: Options): DeviceOpts {
  const deviceOpts: DeviceOpts = { ...initialOpts, ...options }

  if (! options.dllTxt) {
    throw new Error('params dllTxt undefined or blank')
  }
  else {
    deviceOpts.dllTxt = normalize(deviceOpts.dllTxt)
  }

  return deviceOpts
}


/** convert sampling result to base64 */
function parseResultBuffer(buf: Buffer): string {
  const ret = buf.byteLength
    ? buf.toString().replace(/\0+$/, '')
    : ''
  return ret
}
