import { AnyAaaaRecord } from 'dns';
import { App, Editor, editorEditorField, editorLivePreviewField,EditorSelection, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting } from 'obsidian';

// クラス名・インターフェース名の変更を忘れずに！

interface MyPluginSettings {
	cursorMovement: boolean;
	rubi_mode : string;
}

const DEFAULT_SETTINGS: MyPluginSettings = {
	cursorMovement: true,
	rubi_mode : 'full'
}

export default class MyPlugin extends Plugin {
	settings: MyPluginSettings;

	async onload() {
		await this.loadSettings();

		// 現在のエディタインスタンスに対して何らかの処理を行うエディタコマンドを追加
		// 注釈：エディタの内容に対して作用する（この場合テキストを追加する）コマンドってこと？
		this.addCommand({
			id: 'add-rubi',
			name: 'HTMLルビを付与',
			editorCallback: (editor: Editor, view: MarkdownView) => {
				let rubyStart = new RegExp('<ruby>') // ルビ開始記号「<ruby>」検索用
				let rubied_empty = new RegExp('(?<=<ruby>).*(?=<rt></rt></ruby>)')	// 識別用の正規表現「[[rb:.*《》」
				let text = editor.getSelection();
				let shift = 0;

				if(rubyStart.test(text)==true){ // ルビ開始記号が存在する場合（ルビ部分の中身の有無次第で、傍点付与を行う）
					if(rubied_empty.test(text)==true){ // ルビ内容の記述なし（以下で処理を行う）
						new Notice("ルビの内容が記入されていません。\n傍点付与を行います。");
						let rubied = text.match(rubied_empty)?.toString(); // 親文字の抽出
						let emphasis_Text="";
						for(let i=0; i<rubied.length; i++){	// 親文字1つずつ処理
							emphasis_Text+=("<ruby>" + rubied[i] + "<rt>" + "・" + "</rt></ruby>");// emphasis_Text に結合（文字列の1文字1文字にルビ記号と傍点が付与されるように）
						}
						editor.replaceSelection(emphasis_Text); // 文字列置換
						let str_length = emphasis_Text.length;
						shift = 0;
					}
					else{ // そうでない（ルビ内容の記述あり）
						new Notice("ルビの内容が記述されています。\n変更は行われません。");
					}
				}
				else{ // ルビ記号が見つからない場合（記号付与）
					new Notice("ルビ記号の付与を行います。");
					let newText = ("<ruby>"+text+"<rt>"+"</rt></ruby>");
					editor.replaceSelection(newText);
					let str_length = newText.length;
					shift=12
					if(text.length==0) shift=16;
				}

				// カーソル移動
				if(this.settings.cursorMovement==true){
					editor.setCursor(editor.getCursor().line, editor.getCursor().ch-shift) // カーソル移動
				}
			}
		});

		this.addCommand({
			id: 'publish',
			name: 'ネット小説形式への一括変換',
			editorCallback: (editor: Editor, view: MarkdownView) => {
				let left=""
				let center=""
				let right=""
				switch(this.settings.rubi_mode){
					case "half":
						left = "|"
						center = "《"
						right = "》"
						break;
					case "full":
						left = "｜"
						center = "《"
						right = "》"
						break;
					case "pixiv":
						left = "[[rb:"
						center = " > "
						right = "]]"
						break;
				}

				const rxp_ruby = new RegExp(/<ruby>/g);
				const rxp_rt = new RegExp(/<rt>/g);
				const rxp_rtruby = new RegExp(/<\/rt><\/ruby>/g);

				let text = view.getViewData();
				text = text.replace(rxp_ruby,left);
				text = text.replace(rxp_rt,center);
				text = text.replace(rxp_rtruby,right);
				view.setViewData(text)

			}
		});

		// 設定タブが追加され、プラグインの様々な設定を行うことができます
		this.addSettingTab(new SampleSettingTab(this.app, this));

		// If the plugin hooks up any global DOM events (on parts of the app that doesn't belong to this plugin)
		// Using this function will automatically remove the event listener when this plugin is disabled.
		this.registerDomEvent(document, 'click', (evt: MouseEvent) => {
			console.log('click', evt);
		});

		// When registering intervals, this function will automatically clear the interval when the plugin is disabled.
		this.registerInterval(window.setInterval(() => console.log('setInterval'), 5 * 60 * 1000));
	}

	onunload() {

	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

// 設定画面生成のクラス
class SampleSettingTab extends PluginSettingTab {
	plugin: MyPlugin;

	constructor(app: App, plugin: MyPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const {containerEl} = this;

		containerEl.empty();

		containerEl.createEl('h2', {text: '設定'}); // 設定画面のタイトル

		new Setting(containerEl) // 設定項目の追加
			.setName('カーソル移動')
			.setDesc('文字列置換後、カーソルが適した位置に移動する')
			.addToggle(toggle => toggle
					.setValue(this.plugin.settings.cursorMovement)
						.onChange(async (value) => {
						this.plugin.settings.cursorMovement = value;
						await this.plugin.saveSettings();
					})
				);

		new Setting(containerEl)
		.setName('モード設定')
		.setDesc('一括変換コマンドで使用する記号を指定')
		.addDropdown(dropDown =>  dropDown
			.addOption('half', 'なろう半角——|文字《ルビ》')
			.addOption('full', 'なろう全角——｜文字《ルビ》')
			.addOption('pixiv','pixiv——[[rb:文字 > ルビ]]')
			.setValue(this.plugin.settings.rubi_mode)
			.onChange(async (value) =>	{
				this.plugin.settings.rubi_mode = value;
				await this.plugin.saveSettings();
			})
		);	}
}
