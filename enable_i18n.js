const fs = require("fs");
const path = require("path");

const apiDir = path.join(__dirname, "src/api");
const apis = [
  "hero",
  "about",
  "blog-post",
  "contact",
  "faq",
  "footer",
  "online-consultation",
  "service",
];

apis.forEach((api) => {
  const schemaPath = path.join(
    apiDir,
    api,
    "content-types",
    api,
    "schema.json",
  );

  if (fs.existsSync(schemaPath)) {
    console.log(`Processing ${api}...`);
    const schema = JSON.parse(fs.readFileSync(schemaPath, "utf8"));

    // Enable i18n for the Content Type
    schema.pluginOptions = schema.pluginOptions || {};
    schema.pluginOptions.i18n = { localized: true };

    // Enable i18n for attributes
    for (const [key, attr] of Object.entries(schema.attributes)) {
      // Skip system fields or fields that shouldn't be localized if any (usually we localize everything content-related)
      if (
        [
          "uid",
          "createdAt",
          "updatedAt",
          "publishedAt",
          "createdBy",
          "updatedBy",
        ].includes(key)
      )
        continue;

      // Add localization to text/media/component fields
      if (
        [
          "string",
          "text",
          "richtext",
          "media",
          "component",
          "dynamiczone",
          "json",
        ].includes(attr.type)
      ) {
        attr.pluginOptions = attr.pluginOptions || {};
        attr.pluginOptions.i18n = { localized: true };
      }
    }

    fs.writeFileSync(schemaPath, JSON.stringify(schema, null, 2));
    console.log(`Updated ${api}`);
  } else {
    console.log(`Schema not found for ${api}: ${schemaPath}`);
  }
});
