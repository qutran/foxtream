import openEditor from 'open-editor';

export function open(path: string) {
  openEditor([path], { editor: 'vscode' });
}
