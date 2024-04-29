// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "add-dakuten" is now active in the web extension host!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('add-dakuten.converter', () => {
		// The code you place here will be executed every time your command is executed

		// ここに配置されたコードは、コマンドが実行されるたびに実行される

		const editor = vscode.window.activeTextEditor; // アクティブエディタの情報を取得
		if(typeof(editor)!='undefined'){
			let text = editor.document.getText(editor.selection); // 選択範囲の文字列を取得
			let replace_str="" // 選択文字列に濁点付与した文字列を格納（選択文字列と置換するモノ）

			// ユーザー設定を確認
			let soundmark = vscode.workspace.getConfiguration('add-dakuten').selector; // 濁点の方式に関する設定を取得
			let cursor = vscode.workspace.getConfiguration('add-dakuten').cursor; // カーソル移動に関する設定を取得
			// コマンド実行時に毎回参照するのはパフォーマンスに影響するかも？
			// 問題がありそうであれば、（ユーザーに再起動を強いてしまうけど）機能有効時に1回だけ実行される部分、13行目の直下に移すこと

			// 文字列生成
			if(text.includes(soundmark) == true){ // 例外処理（選択文字列のなかに、既に濁点が存在する場合）
				// 濁点を除去した文字列を生成
				vscode.window.showWarningMessage("濁点を除去")
				replace_str = text.replace(RegExp(soundmark, "g"),""); // 濁点(U+3099)を、空文字列で上書き
			}
			else if(text.length==0){
				vscode.window.showErrorMessage("対象が存在しない")
				return 0;
			}
			else{ // 通常処理
				// 濁点が存在しない場合、濁点を付与した文字列を生成
				vscode.window.showInformationMessage("濁点を付与")
				for (var i=0; i<text.length; i++){ // 選択文字列を1文字ずつ処理
					replace_str = replace_str + text.charAt(i) + soundmark; // 「1文字 + 結合文字の濁点(U+3099)」をreplace_strに格納
				}
			}

			// 置換
			editor.edit(builder => builder.replace(editor.selection,replace_str)); // 選択文字列 -> replace_strに置換

			// ユーザーの設定次第では、カーソル移動処理を実行（処理実行後、選択範囲の末尾にカーソルが移動するように）
			if(cursor==true){
				let position = editor.selection.active;
				let newPosition = position.with(position.line, (editor.selection.start.character + replace_str.length)); // 新しいカーソル位置の定義（文字列の選択開始位置までの文字数 + 選択範囲に記号を付与した文字数-shift）
				let newSelection = new vscode.Selection(newPosition, newPosition); // 新たな選択位置の定義（範囲が同じ位置,同じ位置 ＝カーソルが動くだけ）
				editor.selection = newSelection;	// 定義した選択位置を適用	
			}
		}
	});

	context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
export function deactivate() {}
