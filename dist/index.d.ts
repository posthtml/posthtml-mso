type PluginOptions = {
  /**
  The name of the tag for the plugin to use.

  @default 'outlook'

  @example
  ```js
  import posthtml from 'posthtml'
  import posthtmlMso from 'posthtml-mso'

  const html = `
    <mso only="2013">Show in Outlook 2013</mso>
    <not-mso>Hide from Outlook</not-mso>
  `

  posthtml([
    posthtmlMso({tag: 'mso'})
  ])
    .process(html)
    .then(result => console.log(result.html))

  // Result:
  // <!--[if mso 15]>Show in Outlook 2013<![endif]-->
  // <!--[if !mso]><!-->Hide from Outlook<!--<![endif]-->
  ```
  */
  tag?: string;
};

export type { PluginOptions };
