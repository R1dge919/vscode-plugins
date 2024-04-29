# Obsidian版 ルビ付与プラグイン

- [VSCode版](https://github.com/R1dge919/add-ruby)を簡易移植したもの
- ライブプレビューと共存させたかった都合上、VSCode版とは機能が変わっているため注意

## 機能
### HTMLルビを付与（add-rubi）
- 動作はVSCode版と一緒
  > ただし、下の例のような“ネット小説用の記号”ではなく、実際はHTMLのrubyタグが挿入される。  
  > VSCode版で、rubyModeを`html`にしたときの動作と同じ。
  - 何もないところでコマンドを実行すると、ルビ記号を配置する
      ```
      「」→「｜I《》」
      ```
  - 文字列選択中に実行すると、それを囲むようにルビ記号を配置する
      ```
      「文字列」→「｜文字列《I》」
      ```
  - ルビ文字が記述されていないルビ記号に対して実行すると、傍点を記述する
      ```
      「｜文字列《》」→「｜文《・》｜字《・》｜列《・》I」
      ```

### ネット小説形式への一括変換（publish）
> add-rubiコマンドによるルビは、見た目はルビとして機能しているが、ネット小説用のモノとは書き方が違うため、変換する必要がある
- このコマンドは、テキスト内のすべてのrubyタグ（add-rubiで付与したルビ）を、設定モードに応じて別の記号に一括変換する