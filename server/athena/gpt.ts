
import { Configuration, OpenAIApi } from 'openai';

import { openaiConfig } from './conf';

const key = openaiConfig.key

const configuration = new Configuration({
  apiKey: key,
});
const openai = new OpenAIApi(configuration);

const commandAnswerSchemma =
`{
  "type": "object",
  "required": ["command", "set"],
  "properties": {
    "command": {
      "type": "string",
      "enum": ["create", "update"]
    },
    "useCurrent": {
      "type": "boolean"
    },
    "useChildren": {
      "type": "boolean"
    },
    "filter": {
      "type": "object",
      "required": ["conditions", "operator"],
      "properties": {
        "conditions": {
          "type": "array",
          "minItems": 1,
          "items": {
            "type": "object",
            "required": ["name", "operator", "value"],
            "properties": {
              "name": {
                "type": "string"
              },
              "operator": {
                "type": "string",
                "enum": ["=", ">", "<", "like", "and", "or"]
              },
              "value": {
                "type": "string"
              },
              "conditions": {
                "type": "array",
                "items": {
                  "$ref": "#/properties/filter"
                }
              }
            }
          }
        },
        "operator": {
          "type": "string",
          "enum": ["and", "or"]
        }
      }
    },
    "set": {
      "type": "array",
      "minItems": 1,
      "items": {
        "type": "object",
        "required": ["name", "value"],
        "properties": {
          "name": {
            "type": "string"
          },
          "value": {
            "type": "string"
          }
        }
      }
    }
  }
}
`

const unkaosDescr = `
A user inputs a natural language command request in a task tracker. 
Your task is to parse the input, identify the requested action and any necessary parameters for the action, 
and convert it into a valid JSON that adheres to the following schema: ${commandAnswerSchemma}

Note that verbs resembling a status applied to issues indicate setting the status to that value and do not affect the filter query. 
For example, to close an issue means just to change its status to a status like 'closed' without filtering, 
and to put aside means to set the status to 'put aside'.

The 'command' attribute represents the action that the user wants to perform. 
context issues are current issues on the page or all issues.
The 'useCurrent' attribute is true by default but is false if the user wants to use all issues of the tracker as context. 
The 'useChildren' attribute is false by default, but is true if the user wants to apply the command to the children of the context issues.

The 'set' attribute should contain an array of objects, each with a 'name' and 'value' attribute. 
The 'name' attribute should indicate the name of the field that the user wants to set or update, 
and the 'value' attribute should contain the new value for that field. If the field accepts a limited set of values, 
the 'value' attribute must be one of the available values or set to 'inherit' to copy the value from the context issues (can be current or all).
dont use 'parent...' value, use inherit instead. 
If the field or issue attribute has a list of available values, any values in 'set' and 'filter' must be from the available values list.

The 'filter' is a JSON-based query to select issues to be changed. If rules on selected issues are not specified, 
do not use the 'filter' attribute at all. Be careful not to use any rule that was not strictly asked. Use single quotes for filter strings, 
and do not use quotes for field and attribute names in the filter query. 
A field/attribute name can be only '=', '>', '<', or 'like' to its value. Logical conditions are only 'and', 'or'.

Do not translate any values. Ignore unuseful information like emotions and use only the relevant information.

Available issue attributes are 'sprint', 'status', 'project', 'type', and 'author'. 
The 'num' attribute is the numeric ID, and 'num' is strictly an integer. Available issue fields are:
`

const checkDescr = `


`

export class Gpt {

  private async ask(input: string, context: string = '', temper=0.3): Promise<string> {
    const completion = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [{role: "system", content: context},{role: "user", content: input}],
      temperature: temper,
    });

    console.log(context)

    const gptResponse = completion.data.choices[0].message?.content ?  completion.data.choices[0].message?.content : ''

    return gptResponse
  }



  public async parseUserCommand(input: string, fields: Array<any>, language: string = 'russian'): Promise<any> {
  
    const fieldsStr = JSON.stringify(fields.map((item: any)=>'"' + item.name + '"').join(', '))

    const context = `${unkaosDescr}.
    ${fieldsStr}.`


    const parsedCommandStr = await this.ask(input, context)

    let parsedCommand: any
  
    try {
      parsedCommand = JSON.parse(parsedCommandStr);
    } catch (error) {
      console.log("Error gpt JSON", parsedCommandStr)
      parsedCommand = {}
    }

    return parsedCommand

  }

}

export default Gpt
