import { terser } from "rollup-plugin-terser"
import commonjs from 'rollup-plugin-commonjs';
import nodeResolve from 'rollup-plugin-node-resolve';
import typescript from 'rollup-plugin-typescript2'

export default {
    output: {
        format: "umd",
        file: "cdn/tarant-" + require("./package.json").version + ".min.js",
        name: "tarant"
    },
    input: "lib/index.ts",
    plugins: [
        nodeResolve(), 
        commonjs(), 
        typescript({
            rollupCommonJSResolveHack: true,
            objectHashIgnoreUnknownHack: true,
            tsconfigOverride: { compilerOptions: { module: "ESNext" } }
        }),
        terser()]
}