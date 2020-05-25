// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import { resolveCliPathFromVSCodeExecutablePath } from "vscode-test";
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
  //   const commandHandler = (name: string = "world") => {
  //     console.log(`Hello ${name}!!!`);
  //   };

  let disposable = vscode.commands.registerCommand(
    "extension.addnew",
    async () => {
      // The code you place here will be executed every time your command is executed
      let result = await vscode.window.showInputBox({
        placeHolder:
          "For example :TodoDto.cs, IDateTime.cs, Models/Todo.cs, cqr+TodoLists, Application/cqr+TodoLists",
        // validateInput: text => {
        // 	vscode.window.showInformationMessage(`Validating: ${text}`);
        // 	return text === '123' ? 'Not 123!' : null;
        // }
      });
      //vscode.window.showInformationMessage(vscode.workspace.name);

      let inputText = result;
      let filesToCreate: string[] = [];
      if (inputText && inputText.length > 0) {
        var files = inputText.split(",");
        files.forEach((element) => {
          let fileName: string = path.basename(element);
          let filePath: string = path.dirname(element);
          if (fileName.startsWith("cqr+")) {
            let _fileName = fileName.substring(4, fileName.length - 1);
            let filePathCommand = path.join(
              filePath,
              fileName.substring(4, fileName.length),
              "Commands"
            );
            let filePathQuery = path.join(
              filePath,
              fileName.substring(4, fileName.length),
              "Queries"
            );
            let fileNameWithPath: string = "";
            //post
            fileNameWithPath = path.join(
              filePathCommand,
              "Create" + _fileName,
              "Create" + _fileName + "Command.cs"
            );
            filesToCreate.push(fileNameWithPath);
            //put
            fileNameWithPath = path.join(
              filePathCommand,
              "Update" + _fileName,
              "Update" + _fileName + "Command.cs"
            );
            filesToCreate.push(fileNameWithPath);
            //Delete
            fileNameWithPath = path.join(
              filePathCommand,
              "Delete" + _fileName,
              "Delete" + _fileName + "Command.cs"
            );
            filesToCreate.push(fileNameWithPath);
            //get
            //fileNameWithPath = path.join(filePath, "Queries");
            //all
            fileNameWithPath = path.join(
              filePathQuery,
              "Get" + _fileName + "s",
              "Get" + _fileName + "s" + "Query.cs"
            );
            filesToCreate.push(fileNameWithPath);
            //single
            fileNameWithPath = path.join(
              filePathQuery,
              "Get" + _fileName + "Detail",
              "Get" + _fileName + "DetailQuery.cs"
            );
            filesToCreate.push(fileNameWithPath);
          } else {
            filesToCreate.push(element);
          }
        });
        filesToCreate.forEach((element) => {
          let fileName: string = path.basename(element);
          let filePath: string = path.dirname(element);

          GenerateFiles(filePath, fileName);
          if (fileName.toLowerCase().endsWith("command.cs")) {
            GenerateFiles(filePath, fileName.replace(".cs", "Validator.cs")); //Validator
          }
        });
      }

      // Display a message box to the user
      //vscode.window.showInformationMessage("Hello World from Add New File!");
    }
  );

  context.subscriptions.push(disposable);
}

function GenerateFiles(filePath: string, fileName: string) {
  let csContent = `using System;
	using System.Collections.Generic;
	using System.Linq;
	using System.Text;
	using System.Threading.Tasks;
	
	namespace {namespace}
	{
		public class {itemname}
		{
			
		}
	}`;
  let csInterface = `using System;
	using System.Collections.Generic;
	using System.Linq;
	using System.Text;
	using System.Threading.Tasks;
	
	namespace {namespace}
	{
		public interface {itemname}
		{
			
		}
	}
	
	`;
  let csCqrs = `using System;
	using System.Collections.Generic;
	using System.Linq;
	using System.Text;
	using System.Threading.Tasks;
	
	namespace {namespace}
	{
		public class {itemname} : IRequest<int>
		{
	
		}
	
		public class {itemname}Handler : IRequestHandler<{itemname}, int>
		{
			
		}
	}
	
		`;
  let cqValidator = `using System;
		using System.Collections.Generic;
		using System.Linq;
		using System.Text;
		using System.Threading.Tasks;
		
		namespace {namespace}
		{
			public class {itemname} : AbstractValidator<{itemvalidator}>
			{
	
			}
		}
		`;

  let fileName_ = fileName;
  let folderPath: string = path.join(vscode.workspace.rootPath, filePath); //workspaceFolders[0].uri.path;
  switch (true) {
    case fileName_.toLowerCase().endsWith("command.cs") ||
      fileName_.toLowerCase().endsWith("query.cs"): //todo: pass cqrs parameter or something
      csContent = csCqrs;
      break;
    case fileName_.toLowerCase().endsWith("commandvalidator.cs"):
      csContent = cqValidator;
      break;
    case fileName_.startsWith("I") && fileName_.endsWith(".cs"):
      csContent = csInterface;
      break;
    case fileName_.endsWith(".cs"):
      csContent = csContent;
      break;

    default:
      break;
  }

  let namespaceName = vscode.workspace.name || "";
  namespaceName = namespaceName.concat(
    filePath.length > 1
      ? "." + filePath.replace(new RegExp("\\\\", "g"), ".")
      : ""
  );

  csContent = csContent
    .replace(new RegExp("{itemname}", "g"), fileName_!.split(".")[0] || "")
    .replace("{namespace}", namespaceName || "") //.workspaceFolders[0].name);
    .replace(
      "{itemvalidator}",
      fileName_!.split(".")[0].replace("Validator", "")
    );

  //folderPath = `C:\\DWork\\Samples\\ExtensionTest`;
  //folderPath = path.join(folderPath, fileName_);
  fs.mkdir(folderPath, { recursive: true }, (err: any) => {
    if (err) {
      console.error(err);
      return vscode.window.showErrorMessage("Folder Create failed");
    }
    if (fs.existsSync(path.join(folderPath, fileName_))) {
      return vscode.window.showErrorMessage(fileName_ + " already exists");
    }
    fs.writeFile(path.join(folderPath, fileName_), csContent, (err: any) => {
      if (err) {
        console.error(err);
        return vscode.window.showErrorMessage("Create failed");
      }
      //return vscode.window.showInformationMessage("Done");
    });
  });
  //   .writeFile(path.join(folderPath, fileName_), csContent, (err: any) => {
  //     if (err) {
  //       console.error(err);
  //       return vscode.window.showErrorMessage("Create failed");
  //     }
  //     //return vscode.window.showInformationMessage("Done");
  //   });
}

// this method is called when your extension is deactivated
export function deactivate() {}
