const mason = require('@joomlatools/mason-tools-v1');
const colors = require('tailwindcss/colors')
const plugin = require('tailwindcss/plugin');

async function compile() {
    await mason.css.processFolder('assets/postcss', 'assets/css', {
        sass: false,
        tailwind: {
            purge: {
                enabled: true,
                content: [
                    '*.html',
                ],
            },
            options: {
                keyframes: true,
            },
            theme: {
                container: {
                    center: true,
                },
                colors: {
                    transparent: 'transparent',
                    current: 'currentColor',
                    black: colors.black,
                    white: colors.white,
                    gray: colors.coolGray,
                    warmgray: colors.warmGray,
                    blue: '#2373B7',
                },
                extend: {
                    screens: {
                        'xs': '480px',
                        'sm-max': {
                            'max': '767px'
                        },
                    },
                    maxHeight: {
                        none: "none",
                    },
                }
            },
            boxShadow: {
                outline: '0 0 0 3px rgba(120, 128, 35, 0.5)',
            },
            variants: {
                opacity: ['responsive', 'hover'],
                margin: ['focus', 'focus-within'],
                borderWidth: ['responsive', 'first', 'last', 'hover', 'focus'],
                width: ['responsive', 'hover', 'focus-within'],
                extend: {
                    translate: ['focus-within'],
                }
            },
        },

        postcssPresetEnv: {
            stage: 2, // default is 2 (A Working Draft championed by a W3C Working Group.)
            /*autoprefixer: {
                cascade: true,
                grid: true
            },*/
            features: {
                'focus-within-pseudo-class': false, // Attempt at fixing build error
                // https://github.com/tailwindlabs/tailwindcss/discussions/2462
            },
        },
    });
}

async function sync() {
    mason.browserSync({
        watch: true,
        /*server: {
           baseDir: './sites/lanarkshire/theme'
        },*/
        proxy: 'http://localhost/a11y-multilevel-menu/',
        files: 'assets/css/*.css',
    });
}

module.exports = {
    version: '1.0',
    tasks: {
        compile,
        sync,
        watch: {
            path: ['assets/postcss'],
            callback: async(path) => {
                if (path.endsWith('.css')) {
                    await compile();
                }
            },
        },
    },
};