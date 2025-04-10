/* 
以下は学習内容をメモしたものです。
-----------------------------------------
*/

let x = 1;
const y = 2;    // 再代入不可、ただしオブジェクトのプロパティは可変
let obj: {
    readonly foo: number;   // TypeScript
    // constは変数への代入を禁止、readonlyはプロパティへの代入禁止
}
var namu = "taro";  // varはもう使わない
// 同名変数の宣言
// グローバル変数の上書き
// 変数の巻き上げ
// 関数スコープ


// 型注釈 TypeScript
const num: number = 123;

// 型推論...コンパイルのタイミング
// 動的型付け...実行時

// プリミティブ型とオブジェクト
// プリミティブ型をオブジェクトに自動偏する機能...オートボクシング "name".length;
// プリミティブ型: boolean, number, string, undefinend, null, symbol, bigint
// オートボクシングで変換先となるオブジェクト（ラッパーオブジェクト）: Boolean, Number, String, Symbol, BigInt
// TypeScriptでは型も存在する
const bool: Boolean = false;

// TypeScript
// リテラル型（boolean, number, string）
let x: 1;   // 1だけ代入可能な型
// 一般的にマジックナンバーやステートの表現で用いる
let num: 1 | 2 | 3 = 1;

// any型 何でも許す

// オブジェクトリテラルと型注釈
let box: {
    witdh: number; 
    height: number 
};

// 型エイリアス
type Box = {
    witdh: number;
    height: number;
};
let box: Box;

// オプショナル型
type Size = {
    width?: number;
}
const size: Size = {};  // OK, ただしnullはだめ（strictNullChecksがFalseの場合は許可される）





// Reactの3大特徴
// 仮想DOM...DOMとはHTMLを操作するためのAPIのようなもの。これをよりバグを起こしにくいものにしたもの
// 宣言的UI...命令的ではないではないので、「このような表示になってほしい」という目標だけが書かれる
// コンポーネントベース...再利用できる


// JSX
// JavaScriptのコード内にHTMLタグのような構文を埋め込み可能とする。特にReactで採用されている。
const element = (
    <div>
        <br />
        <br />
    </div>
);
// スタイル属性はオブジェクト
<div style={{ backgroundColor: "yellow", color: "blue" }}>Hello!</div>;
// 条件式
const isUser = true;
const greeting = isUser ? <h1>Welcome back!</h1> : <h1>Please sign up.</h1>;
// ループ
const numbers = [1, 2, 3];
const list = (
    <ul>
        {numbers.map((number) => (
            <li key={number.toString()}>{number}</li>
        ))}
    </ul>
);
// 関数宣言
function hello(){
    return "hello";
}
function increment(num: number): number {   // 引数と戻り値の型注釈
    return num + 1;
}
// 関数式（関数名を省略できる: 無名関数）
const increment = function (n: number): number {
    return n + 1;
};
button.addEventListener("click", function (event) { // 直接引数にも渡せる
    console.log("クリックされました");
});
// アロー関数
const increment = (n) => {  // 引数が一つなら括弧を省略できる n => 
    return n + 1;
}
const getOne = () => {
    return 1;
};
const increment = n => n + 1;   // 関数内のコード式が1つ場合
const increment = (num: number): number => num + 1;

// 関数の型宣言
type Increment = (num: number): number => num + 1;
const increment: Increment = function (num: number): number {
    return num + 1;
};
