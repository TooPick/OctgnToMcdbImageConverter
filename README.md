# OctgnToMcdbImageConverter

Tool used to rename all OCTGN images in a folder with their card id using the set.xml OCGTN file.

Example:

    0a0dbe64-2e99-45f5-b797-8c29cce9d8eb.jpg

became

    16002.jpg

## How to use

- Install dependencies

      npm install

- Run the script

      node index.js

- Options

      -v, --version         output the version number
      -i, --input <value>   images input dir (default: "./input_folder/")
      -o, --output <value>  images output dir (default: "./output_folder/")
      -x, --xml <value>     set.xml input file (default: "./set.xml")
      -h, --help            display help for command
