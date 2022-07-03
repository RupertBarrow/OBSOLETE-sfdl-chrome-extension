import { LightningElement, track } from 'lwc';
import { getAllCookiesFromSalesforceDomain, isSessionInformationValid } from 'sfdl/authentication';

const tabNavigation = {
    analyseLogs:{tab:'.liElementAnalyseLogs', body:'.sfdl-analise-logs', open:'openAnaliseLogs'},
    compareLogs:{tab:'.liElementCompareLogs', body:'.sfdl-compare-logs', open:'openCompareLogs'},
    compareOrgs:{tab:'.liElementCompareOrgs', body:'.sfdl-compare-orgs', open:'openCompareOrgs'}
}

export default class Console extends LightningElement {
    showLogListSection = true;
    renderLogList = false;
    
    showToastMessage = false;
    toastAction;
    toastHeader;
    toastMessage;
    toastInProgress = false;
    toastCloseSetTimeoutId;
    manipulationOptions;

    openAnaliseLogs=true;
    openCompareLogs=false;
    openCompareOrgs=true;

    logList = [];
    isDownloadInProgress = false;

    @track picklistInformation = [];
    @track sessionInformation;

    connectedCallback(){
        this.init();
    }

    async init(){
        const allSalesforceCookies = await getAllCookiesFromSalesforceDomain();
        this.createCookiesSession4SfdlPicklist(allSalesforceCookies);
    }

    async createCookiesSession4SfdlPicklist(allSalesforceCookies){
        allSalesforceCookies.forEach(async cookie => {
            let isAValidSession = await isSessionInformationValid(cookie);
            if(isAValidSession){
                this.picklistInformation.push({ label: 'https://' + cookie.domain, value:cookie.value });
            }
        });
    }

    async handleLogDetails(event){
        let sfdlLogDetailsComponent = this.template.querySelector('sfdl-log-details');
        sfdlLogDetailsComponent.processLogsFromLogList(event.detail.logDetails, event.detail.logName);
    }

    handleDisplayLogListSection(event){
        this.showLogListSection = !this.showLogListSection;
        this.template.querySelector('.sfdl-console-log-list-section').classList[event.detail.classAction]('slds-is-open');
    }

    hideMonacoEditor(){
        this.template.querySelector('sfdl-log-details').hideMonacoEditor();
    }

    async handleSessionInformation(event){
        this.hideMonacoEditor();
        this.renderLogList = false;
        await new Promise((resolve)=>{setTimeout(resolve, 100);});
        this.renderLogList = true;
        this.sessionInformation = event.detail.sessionInformation;
    }

    async handleToastMessage(event){
        await this.closeToastIfOpenWhileAnotherExceptionOccurs();
        this.toastAction = event.detail.action;
        this.toastHeader = event.detail.header;
        this.toastMessage = event.detail.message;
        this.showToastMessage = true;
        this.toastInProgress = true;

        if(event.detail.enableQuerySearch){
            this.template.querySelector('sfdl-picklist').disableActionButtons(false);
        }

        this.toastCloseSetTimeoutId = setTimeout(() => {
            this.showToastMessage = false;
            this.toastInProgress = false;
        },4000);
    }

    async closeToastIfOpenWhileAnotherExceptionOccurs(){
        if(this.toastInProgress){
            clearTimeout(this.toastCloseSetTimeoutId);
            this.showToastMessage = false;
            await new Promise(resolve => setTimeout(resolve, 200));
        }
    }

    handleManipulationOptions(event){
        if(this.template.querySelector('sfdl-log-list')){
            this.template.querySelector('sfdl-log-list').handleManipulationOptionsForDownloading(event.detail.manipulationOptions);
        }
    }

    async handleTabNavigation(event){
        if(!this.openCompareLogs && this.noLogs2Compare(event)){
            await this.closeToastIfOpenWhileAnotherExceptionOccurs();
            this.toastAction = this.isDownloadInProgress ? 'warning' : 'error';
            this.toastHeader = 'Compare Logs';
            this.toastMessage = this.isDownloadInProgress ? 'Retrieving logs in progress...' : 'There are no logs to compare, select an org with logs';
            this.showToastMessage = true;
            this.toastInProgress = true;
    
            this.toastCloseSetTimeoutId = setTimeout(() => {
                this.showToastMessage = false;
                this.toastInProgress = false;
            },4000);
            return;
        }

        this.inactiveAllTabs();
        this.activateTab(event);
        this.hideAllContent();
        this.showContentBasedOnTab(event);
    }

    noLogs2Compare(event){
        return event.target.dataset.tabname === 'compareLogs' && !this.logList.length;
    }

    activateTab(event){
        this[tabNavigation[event.target.dataset.tabname].open] = true;
        this.template.querySelector(tabNavigation[event.target.dataset.tabname].tab).classList.add('slds-is-active');
    }

    inactiveAllTabs(){
        this.template.querySelectorAll('li').forEach( liElement => {
            liElement.classList.remove('slds-is-active');
        });
    }

    showContentBasedOnTab(event){
        this.template.querySelector(tabNavigation[event.target.dataset.tabname].body).classList.remove('slds-hide');
        this.template.querySelector(tabNavigation[event.target.dataset.tabname].body).classList.add('slds-show');
    }

    hideAllContent(){
        this.template.querySelectorAll('.slds-tabs_scoped__content').forEach( contentElement => {
            contentElement.classList.remove('slds-show');
            contentElement.classList.add('slds-hide');
        });
    }

    handleLogList(event){
        this.closeToastIfOpenWhileAnotherExceptionOccurs();
        this.logList = event.detail.logList;
        this.openCompareLogs = true;
        this.showToastMessage = false;
        this.toastInProgress = false;
    }
    
    handleDownloadInProgress2Compare(){
        this.isDownloadInProgress = true;
    }
}