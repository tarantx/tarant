import babel from 'rollup-plugin-babel';
import uglify from 'rollup-plugin-uglify';

export default {
    input: "lib/index.js",
    plugins: [
        babel({
            "presets": [
                [
                    "env",
                    {
                        "modules": false
                    }
                ]
            ],
            "plugins": [
                [
                    "transform-object-rest-spread",
                    {
                        "useBuiltIns": false
                    }
                ]
            ],
            "babelrc": false,
        }),
        uglify()
    ],
    output: [{
        name: "wind",
        format: "cjs",
        file: "dist/wind.cjs.js",
    }]
}
