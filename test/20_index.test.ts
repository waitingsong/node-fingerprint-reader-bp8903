/// <reference types="mocha" />

import { dirname } from '@waiting/shared-core'
import { basename } from 'path'
import * as assert from 'power-assert'
import { defer, zip, EMPTY } from 'rxjs'
import { catchError, delay, finalize, map, merge, mergeMap, shareReplay, tap } from 'rxjs/operators'

import * as fpr from '../src/index'
import { Device, Options } from '../src/lib/model'


const filename = basename(__filename)
const dllTxt = 'd:/drivers/finger/nantian-8903/ABC_COM_TESO.dll'

describe(filename, () => {

  it('Should sampleFP() works', async () => {
    const opts: Options = {
      dllTxt,
      dllSearchPath: dirname(dllTxt),
      port: 5,
      debug: false,
    }

    try {
      const devices = await fpr.init(opts)

      if (! devices.length) {
        assert(false, 'No device found')
        return
      }
      console.info(`\n
      ----------------------------------------
      Please put your finger on the device THREE times...
      ----------------------------------------
      \n`)
      const ret: string = await fpr.sampleFP(devices[0])

      console.info(ret)
      assert(!! ret, 'Result Data invalid')
    }
    catch (ex) {
      assert(false, ex)
    }
  })
})


describe(filename, () => {
  it('Should validateFP() works', done => {
    const opts: Options = {
      dllTxt,
      dllSearchPath: dirname(dllTxt),
      port: 5,
      debug: false,
    }

    const device$ = defer(() => fpr.init(opts)).pipe(
      tap(devices => {
        if (!devices.length) {
          // assert(false, 'No device found')
          throw new Error('No device found')
        }
      }),
      map(devices => devices[0]),
      shareReplay(1),
    )

    const samping$ = device$.pipe(
      delay(500),
      tap(() => {
        console.info(`\n
        ----------------------------------------
        Please put your finger on the device...
        ----------------------------------------
        \n`)
      }),
      delay(500),
      mergeMap(device => fpr.sampleFP(device, 'simple')),
      tap(fp => {
        if (! fp) {
          throw new Error('Result Data invalid')
        }
      }),
    )

    const validate$ = zip(device$, samping$).pipe(
      delay(500),
      tap(() => {
        console.info(`\n
        ----------------------------------------
        Please put your finger on the device again...
        ----------------------------------------
        \n`)
      }),
      delay(500),
      mergeMap(([device, fp]) => fpr.validateFP(device, fp)),
      tap(matched => {
        if (! matched) {
          throw new Error('validating failed. NOT matched')
        }
      }),
      catchError((err: Error) => {
        assert(false, err.message)
        return EMPTY
      }),
      finalize(() => done()),
    )

    validate$.subscribe()
  })

})
