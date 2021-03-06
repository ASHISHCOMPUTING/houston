/**
 * houston/src/worker/task/appstream/exec.ts
 * Checks that a exec field starts with app name in the desktop file
 */

import * as fs from 'fs-extra'
import * as ini from 'ini'
import * as path from 'path'

import { sanitize } from '../../../lib/utility/rdnn'
import { Log } from '../../log'
import { Task } from '../task'

export class DesktopExec extends Task {

  /**
   * Returns the desktop file name
   *
   * @return {string}
   */
  public get name () {
    return sanitize(this.worker.context.nameDomain, '-')
  }

  /**
   * Path the desktop file should exist at
   *
   * @return {string}
   */
  public get path () {
    return path.resolve(this.worker.workspace, 'package/usr/share/applications', `${this.name}.desktop`)
  }

  /**
   * Checks Exec field in desktop file
   *
   * @async
   * @return {void}
   */
  public async run () {
    const raw = await fs.readFile(this.path, 'utf8')
    const data = ini.parse(raw)

    if (data['Desktop Entry'] == null) {
      throw new Log(Log.Level.ERROR, 'Missing application data')
    }

    const execValue = (typeof data['Desktop Entry'].Exec === 'string')
      ? data['Desktop Entry'].Exec
      : ''

    if (execValue.startsWith(this.name) === false) {
      throw new Log(Log.Level.ERROR, 'Exec field does not start with binary name')
    }
  }
}
