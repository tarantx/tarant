import babel from 'rollup-plugin-babel';

export default {
    input: "lib/index.js",
    plugins: [babel({
        "plugins": [
            [
                "transform-object-rest-spread",
                {
                    "useBuiltIns": false
                }
            ]
        ]
        }
    )],
    output: [{
        name: "wind",
        format: "cjs",
        file: "dist/wind.cjs.js",
    }]
}
