declare global {
    namespace Electron {
        interface BrowserWindowConstructorOptions {
            windowData: any;
        }

        interface WebContents {
            browserWindowOptions: BrowserWindowConstructorOptions;
        }
    }
}

import './array.override';
