// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { rewriteReadme } from './rewriteEngine'


// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  const disposable = vscode.commands.registerCommand('rewrite readme', async () => {
	
	const apiKey = vscode.workspace
		.getConfiguration()
		.get<string>('readme-universe.apiKey');

	if (!apiKey) {
		vscode.window.showErrorMessage('No OpenAI API key found. Please set it in settings.json')
		return
	}

    const editor = vscode.window.activeTextEditor
    if (!editor || !editor.document.fileName.endsWith('README.md')) {
      vscode.window.showErrorMessage('Open a README.md file')
      return
    }

    const content = editor.document.getText()

    const style = await vscode.window.showQuickPick([
      'horror', 'poetic', 'drama', 'mystery', 'sci-fi', 'fantasy',
      'league of legends', 'world of warcraft', 'star wars'
    ], { placeHolder: 'Choose a README remix style' })

    if (!style){
		vscode.window.showErrorMessage('Please select a style')
		return
	}

	const model = await vscode.window.showQuickPick(['gpt-4', 'gpt-3.5-turbo'], { placeHolder: 'gpt 4 is better but more expensive'})

	if(!model){
		vscode.window.showErrorMessage('Please select a model')
		return
	}

    const remixed = await rewriteReadme(content, style, apiKey, model)

	const fileUri = await vscode.window.showSaveDialog({
		defaultUri: vscode.Uri.joinPath(
			vscode.workspace.workspaceFolders?.[0]?.uri!,
			`README.${style.toLowerCase()}.md`
		),
		filters: {
			Markdown: ['md']
		}
	});

	if (fileUri) {
		await vscode.workspace.fs.writeFile(fileUri, Buffer.from(remixed, 'utf8'));
		const doc = await vscode.workspace.openTextDocument(fileUri);
		await vscode.window.showTextDocument(doc);
		vscode.window.showInformationMessage(`Saved as ${fileUri.fsPath}`);
	}
  })

  context.subscriptions.push(disposable)
}

// This method is called when your extension is deactivated
export function deactivate() {}
