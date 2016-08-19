
import { config } from '../config';
import { loadScript } from '../lib';
import { BUTTON_JS_URL } from './constants';
import { logDebug, logError } from './log';
import { eachElement } from './util';

let buttonJS;

function loadButtonJS() {

    if (buttonJS) {
        return buttonJS;
    }

    logDebug(`buttonjs_load`);

    buttonJS = loadScript(BUTTON_JS_URL);

    return buttonJS.then(result => {
        logDebug(`buttonjs_load_success`);
        return result;
    }).catch(err => {
        logError(`buttonjs_load_error`, { error: err.stack || err.toString() });
        throw err;
    });
}

function renderButton(id, container, options, label) {

    let lc    = options.locale || `${config.locale.lang}_${config.locale.country}`;
    let color = options.color  || 'gold';
    let shape = options.shape  || 'pill';
    let size  = options.size   || 'small';

    let type = 'button';
    label = label || 'checkout';

    logDebug(`render_button_lc_${lc}`);
    logDebug(`render_button_color_${color}`);
    logDebug(`render_button_shape_${shape}`);
    logDebug(`render_button_size_${size}`);
    logDebug(`render_button_label_${label}`);

    let buttonDom = window.paypal.button.create(id, { lc, color, shape, size }, { type, label });
    container.appendChild(buttonDom.el);
    return buttonDom.el.childNodes[0];
}

export function renderButtons(id, options) {

    return loadButtonJS().then(() => {

        let buttons = [];

        if (options.container) {

            let labels = [];

            if (typeof options.type === 'string') {
                labels.push(options.type);
            } else if (options.type instanceof Array) {
                labels = options.type;
            }

            eachElement(options.container, (container, i) => {
                buttons.push({
                    el: renderButton(id, container, options, labels[i]),
                    click: options.click,
                    condition: options.condition
                });
            });
        }

        if (options.buttons instanceof Array) {
            options.buttons.forEach(button => {
                if (button) {
                    button.click = button.click || options.click;
                    eachElement(button.container, container => {
                        buttons.push({
                            el: renderButton(id, container, button, button.type),
                            click: button.click || options.click,
                            condition: button.condition || options.condition
                        });
                    });
                }
            });
        }

        return buttons;
    });
}