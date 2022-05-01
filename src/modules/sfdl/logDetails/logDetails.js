import { LightningElement,api } from 'lwc';
import * as monaco from 'monaco-editor';

export default class LogDetails extends LightningElement{
    @api showLogListSection;
    logName = '';
    logDetails;
    showMonacoEditor;
    toggleImage = '/slds/icons/utility/toggle_panel_right.svg';

    @api
    async displayLogsDetailsFromLogList(logDetails, logName){
        this.logDetails = logDetails;
        await this.renderedMonacoEditor();
        if(this.template.querySelector('.sfdlMonacoEditor')){
            this.logName = logName;
            monaco.editor.create(this.template.querySelector('.sfdlMonacoEditor'), {
                value: logDetails,
                automaticLayout: true
            });
        }
    }
 
    async renderedMonacoEditor(){
        this.showMonacoEditor = false;
        await new Promise((resolve)=>{setTimeout(resolve, 100);});
        this.showMonacoEditor = true;
        await new Promise((resolve)=>{setTimeout(resolve, 100);});
    }

    handleHideShowSections(){
        this.toggleImage = this.showLogListSection ? 
            '/slds/icons/utility/toggle_panel_left.svg' : '/slds/icons/utility/toggle_panel_right.svg' ;

        this.dispatchEvent(new CustomEvent('displayloglistsection',{
            detail: { 
                classAction: this.showLogListSection ? 'remove' : 'add'
            }
        }))
    }
}