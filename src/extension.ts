// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
const fs = require("fs");
const path = require("path");
// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  console.log('Congratulations, your extension "addnewfile" is now active!');

  // The command has been defined in the package.json file
  // Now provide the implementation of the command with registerCommand
  // The commandId parameter must match the command field in package.json
  const commandHandler = (name: string = 'world') => {
    console.log(`Hello ${name}!!!`);
  };

  let disposable = vscode.commands.registerCommand("extension.addnew", async () => {
    // The code you place here will be executed every time your command is executed
	let result =  await vscode.window.showInputBox({
		placeHolder: 'For example: Person.cs'
		// validateInput: text => {
		// 	vscode.window.showInformationMessage(`Validating: ${text}`);
		// 	return text === '123' ? 'Not 123!' : null;
		// }
	});
	vscode.window.showInformationMessage(vscode.workspace.workspaceFolders);
	//vscode.window.showInformationMessage(vscode.workspace.name);
	let csContent = `
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace {namespace}
{
    public class {itemname}
    {
        $
    }
}
		`;

		csContent = csContent.replace("{itemname}", result);

    const folderPath = vscode.workspace.workspaceFolders[0].uri
      .toString()
      .split(":")[1];
    fs.writeFile(path.join(folderPath, result + ".cs"), csContent, (err) => {
      if (err) {
        console.error(err);
        return vscode.window.showErrorMessage("Create failed");
      }
      return vscode.window.showInformationMessage("Done");
    });
    // Display a message box to the user
    vscode.window.showInformationMessage("Hello World from Add New File!");
  });

  context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {}
