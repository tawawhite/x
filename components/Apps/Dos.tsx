import styles from '@/styles/Apps/Dos.module.scss';

import type { DosFactory, DosMainFn } from 'js-dos';
import type { DosCommandInterface } from 'js-dos/dist/typescript/js-dos-ci';
import type { FC } from 'react';
import type { AppComponent } from '@/contexts/App';

import { useEffect, useRef } from 'react';

type DosWindow = Window & typeof globalThis & { Dos: DosFactory };

interface DosApp extends AppComponent {
  args: Array<string>;
  url: string;
}

const dosOptions = {
  wdosboxUrl: '/libs/wdosbox.js',
  onprogress: () => {}
};

// TODO: Load with basic tools like EDIT and such (MS-DOS tools somewhere?)
// TODO: Mobile support (https://github.com/caiiiycuk/js-dos#mobile-support)

export const DosAppLoader: FC<Partial<DosApp> & AppComponent> = ({
  args = ['-c', 'CLS'],
  url
}) => {
  let ci: DosCommandInterface;
  const canvasRef = useRef<HTMLCanvasElement>(null),
    loadMain = (main: DosMainFn, extraArgs: Array<string> = []) => () =>
      main([...extraArgs, ...args])?.then((value) => {
        ci = value;
      });

  useEffect(() => {
    const { current: canvasElement } = canvasRef as {
        current: HTMLCanvasElement;
      },
      { Dos } = window as DosWindow;

    Dos(canvasElement, dosOptions)?.then(({ fs, main }) => {
      if (url) {
        const appPath = `apps/${url.replace('.jsdos', '')}`;

        fs?.extract(url, appPath)?.then(loadMain(main, ['-c', `CD ${appPath}`]));
      } else {
        loadMain(main)();
      }
    });

    return () => {
      ci?.exit();
    };
  }, [canvasRef]);

  require('js-dos');

  return (
    <canvas
      className={styles.dos}
      onClick={() => {
        (canvasRef.current?.closest(
          ':not(li)[tabindex]'
        ) as HTMLDivElement).focus();
      }}
      ref={canvasRef}
    />
  );
};
