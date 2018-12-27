import { uglify } from "rollup-plugin-uglify";
import commonjs from 'rollup-plugin-commonjs';
import nodeResolve from 'rollup-plugin-node-resolve';
import typescript from 'rollup-plugin-typescript'

export default {
    output: {
        format: "umd",
        file: "cdn/tarant-" + require("./package.json").version + ".min.js",
        name: "tarant"
    },
    input: "lib/index.ts",
    plugins: [
        typescript({
            tsconfig: false,
            target: "es5",
            declaration: true,
            strict: true,
            lib: ["es6"],

        }),
        nodeResolve(), 
        commonjs(), 
        uglify()]
}