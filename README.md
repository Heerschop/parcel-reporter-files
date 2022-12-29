# Parcel Reporter Files

Parcel plugin for file related operations:

- [Remove](#remove)
- [Copy](#copy)
- [Cleanup](#cleanup)

## Installation

```bash
npm install git@github.com:Heerschop/parcel-reporter-files.git#main --save-dev
```

## Update the `.parcelrc` file

Add the plugin to the Parcel config file.

```json
{
  "extends": [
    "@parcel/config-default"
  ],
  "reporters": [
    "...",
    "parcel-reporter-files"
  ]
}
```

## Plugin configuration

The plugin configuration can be put in the `package.json` and or in the `parcel-reporter-files.json` file.

### Example for: `package.json`

```json
{
  ...
  "parcel-reporter-files": {
    "remove": "*",
    "copy": [
      "images/logo.png"
    ],
    "cleanup": "*.tmp"
  }
}
```

### Example for: `parcel-reporter-files.json`

```json
{
  "remove": "*",
  "copy": [
    "images/logo.png"
  ],
  "cleanup": "*.tmp"
}
```

## Remove

Remove files and or directories before copy. Can be a single string or an array of strings. The strings can contain glob patterns from: [fast-glob](https://github.com/mrmlnc/fast-glob#readme)

#### Remove all files that are not a result of the parcel build process

```json
{
  "remove": "*"
}
```

#### Remove all files that are not a result of the parcel build process, and the `.map` files.

```json
{
  "remove": [
    "*",
    "*.map"
  ]
}
```

## Copy

Copy file and or directories. Can be an array of strings or and array of objects containing `source` and `target`. The strings can contain glob patterns from: [fast-glob](https://github.com/mrmlnc/fast-glob#readme)

#### Copy of images to the root of the dist directory

```json
{
  "copy": [
    "images/*.png"
  ]
}
```

#### Copy of images in a dist subdirectory

```json
{
  "copy": [
    {
      "source": "images/*.png",
      "target": "images"
    }
  ]
}
```

## Cleanup

The same as [Remove](#remove) but than executes after copy.

```json
{
  "cleanup": [
    "*.tmp"
  ]
}
```

## Development

### Update Code Style

```bash
npx prettier --write .
npx eslint src/*.js
```
