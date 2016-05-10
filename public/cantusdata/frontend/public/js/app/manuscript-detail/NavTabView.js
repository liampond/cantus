import Radio from 'backbone.radio';
import Marionette from 'marionette';

import template from './nav-tab.template.html';

var manuscriptChannel = Radio.channel('manuscript');


export default Marionette.ItemView.extend({
    template,

    initialize: function ()
    {
        this.listenTo(manuscriptChannel, 'change:folio', this.render);
    },

    serializeData: function ()
    {
        return {
            number: manuscriptChannel.request('folio')
        };
    }
});