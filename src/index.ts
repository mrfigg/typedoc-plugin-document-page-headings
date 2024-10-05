/**
 * @packageDocumentation
 *
 * @document ../LICENSE
 */

'use strict'

import { Application, ParameterType, ReflectionKind, Renderer } from 'typedoc'

import { JSDOM } from 'jsdom'

/** @private */
export function load(app: Application) {
  app.options.addDeclaration({
    name: 'omitDocumentTypeInPageHeadings',
    help: 'When set the "Document" type will be omitted from page headings',
    type: ParameterType.Boolean,
    defaultValue: false,
  })

  let omitDocumentType = false

  app.renderer.on(Renderer.EVENT_BEGIN, () => {
    omitDocumentType = !!app.options.getValue('omitDocumentTypeInPageHeadings')
  })

  app.renderer.on(Renderer.EVENT_END_PAGE, (event) => {
    if (!event.contents || event.model.kind !== ReflectionKind.Document) {
      return
    }

    const dom = new JSDOM(event.contents)
    const window = dom.window
    const document = window.document

    const title = document.querySelector('div.tsd-page-title')

    if (!title) {
      return
    }

    let heading = title.querySelector(
      ':scope > h1, :scope > h2, :scope > h3, :scope > h4, :scope > h5, :scope > h6'
    )

    if (heading) {
      return
    }

    const breadcrumbs = title.querySelector(':scope > ul.tsd-breadcrumb')

    if (!breadcrumbs) {
      return
    }

    const anchors = breadcrumbs.querySelectorAll('a')

    if (!anchors || !anchors.length) {
      return
    }

    const anchor = anchors[anchors.length - 1]

    if (!anchor.textContent) {
      return
    }

    heading = document.createElement('h1')
    heading.textContent = `${omitDocumentType ? '' : `${app.i18n.kind_document()} `}${anchor.textContent}`

    title.append(heading)

    event.contents = dom.serialize()
  })
}
