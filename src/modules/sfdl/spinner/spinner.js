import { LightningElement, api } from 'lwc';

export default class Spinner extends LightningElement{
    @api assistiveText;
    @api spinnerMessage;
}