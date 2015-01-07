//var Manuscript = require(["models/Manuscript"]);
//var CantusAbstractView = require(["views/CantusAbstractView"]);
//var FolioView = require(["views/FolioView"]);
//var DivaView = require(["views/DivaView"]);
//var InternalSearchView = require(["views/InternalSearchView"]);
//var SearchNotationView = require(["views/SearchNotationView"]);

define( ['App', 'backbone', 'marionette', 'jquery',
        "models/Manuscript",
        "views/CantusAbstractView",
        "views/FolioView",
        "views/DivaView",
        "views/InternalSearchView",
        "views/SearchNotationView",
        "singletons/GlobalEventHandler",
        "config/GlobalVars"],
    function(App, Backbone, Marionette, $,
             Manuscript,
             CantusAbstractView,
             FolioView,
             DivaView,
             InternalSearchView,
             SearchNotationView,
             GlobalEventHandler,
             GlobalVars) {

        "use strict";

        /**
         * This page shows an individual manuscript.  You get a nice diva viewer
         * and you can look through the chant info.
         *
         * @type {*|void}
         */
        return Marionette.LayoutView.extend
        ({
            el: '#view-goes-here',
            template: '#manuscript-template',

            id: null,
            manuscript: null,
            searchView: null,
            searchNotationView: null,

            // Subviews
            divaView: null,
            folioView: null,

            regions: {
                divaViewRegion: ".diva-wrapper",
                folioViewRegion: "#folio",
                searchViewRegion: "#manuscript-search",
                searchNotationViewRegion: "#search-notation"
            },

            initialize: function (options) {
                this.manuscript = new Manuscript(
                    String(GlobalVars.siteUrl + "manuscript/" + this.id.toString() + "/"));
                console.log(this.manuscript);
                // Build the subviews
                this.divaView = new DivaView(
                    {
                        siglum: this.manuscript.get("siglum_slug"),
                        folio: options.folio
                    }
                );
                this.folioView = new FolioView();
                this.searchView = new InternalSearchView();
                this.searchNotationView = new SearchNotationView(
                    {
                        divaView: this.divaView
                    }
                );
                // Render every time the model changes...
                this.listenTo(this.manuscript, 'change', this.afterFetch);
                // Switch page when necessary
                this.listenTo(GlobalEventHandler, "manuscriptChangeFolio", this.updateFolio);
            },

            remove: function()
            {
                // Remove the subviews
                this.divaView.remove();
                this.searchView.remove();
                this.searchNotationView.remove();
                this.folioView.remove();
                // Deal with the event listeners
                this.stopListening();
                this.undelegateEvents();
                // Nullify the manuscript model
                this.manuscript = null;
                // Nullify the views
                this.divaView = null;
                this.searchView = null;
                this.searchNotationView = null;
                this.folioView = null;
                // Remove from the dom
                this.$el.empty();
            },

            /**
             *
             * @returns {undefined}
             */
            updateFolio: function()
            {
                console.log("updateFolio() begin.");
                var folio = this.divaView.getFolio();
                // Query the folio set at that specific manuscript number
                var newUrl =  GlobalVars.siteUrl + "folio-set/manuscript/" + this.manuscript.get("id") + "/" + folio + "/";
                // Rebuild the folio View
                this.folioView.setUrl(newUrl);
                this.folioView.setCustomNumber(folio);
                this.folioView.update();
                GlobalEventHandler.trigger("ChangeFolio", folio);
                GlobalEventHandler.trigger("SilentUrlUpdate");
                console.log("updateFolio() end.");
            },

            /**
             * Fetch the manuscript's data from the API.
             */
            getData: function()
            {
                console.log(this.manuscript);
                this.manuscript.fetch();
            },

            afterFetch: function()
            {
                // Set the search view to only search this manuscript
                this.searchView.setQueryPostScript(' AND manuscript:"' + this.manuscript.get("siglum") + '"');
                // TODO: Diva is being initialized twice!!!!!!!
                this.divaView.setManuscript(this.manuscript.get("siglum_slug"));
                this.searchNotationView.setManuscript(this.manuscript.get("siglum_slug"));
                this.render();
            },

            serializeData: function()
            {
                console.log(this.manuscript);
                console.log(this.manuscript.toJSON());
                return this.manuscript.toJSON();
            },

            onRender: function()
            {
                // Render subviews
                if (this.divaView !== undefined) {
                    this.divaViewRegion.show(this.divaView);
                }
                this.renderFolioView();
                this.searchViewRegion.show(this.searchView);
                this.searchNotationViewRegion.show(this.searchNotationView);
                GlobalEventHandler.trigger("renderView");
            },

            renderFolioView: function()
            {
                if (this.divaView !== undefined) {
                    this.folioViewRegion.show(this.folioView);
                }
            }

        });
    });