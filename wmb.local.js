var ikon = {};
ikon.wmb = {

    baseUrl:"http://localhost/wmb/",

    /**
     * Console debug messages
     *
     * @private
     * @type boolean
     */
    debug:true,

    /**
     * Output div
     *
     * @private
     * @type object
     */
    output_element:null,

    /**
     * Collected tier reagents
     *
     * reagents [ tier ] [ {
     *                      id
     *                      name
     *                      icon
     *                      number //integer always!
     *                     }
     *                   ]
     * @private
     * @type object
     */
    reagents:null,

    /**
     *
     * @private
     * @return object
     */
    getAnchorElement:function () {
        var h2s = jqikon("h2[class*='clear']");
        var j_h2s = h2s.length;
        var i = 0;
        for (i = 0; i < j_h2s; i++) {
            if (jqikon(h2s[i]).text() === 'Contribute') {
                return jqikon(h2s[i]).parent();
            }
        }
        //error
        var msg = "No element found as an output anchor";
        if (this.debug) {
            console.error(msg);
        }
    },

    /**
     *
     * @public
     * @return string
     * @param url
     */
    getItemIdFromUrl:function (url) {
        var r = /item=[0-9]{1,}/;
        var m = url.match(r);
        var s = m[0].split('=');
        return s[1];
    },

    /**
     * Main entry point
     *
     * @public
     */
    disassemble:function () {
        //launch only once
        if (jqikon('#ikon_wmb_output').length === 1) {
            var msg = "Material breakdown already launched";
            if (this.debug) {
                console.warn(msg);
            }
            alert(msg);
            return false;
        }

        //can be run on craftable item
        if (!this.isItemCraftable(this.getItemIdFromUrl(document.URL))) {
            alert('This item is not crafted by any professions. Choose another one!');
        }

        //header
        this.dumpOutput('<div class="text">' +
            '<h2 id="ikon_wmb_header" class="clear">Material breakdown</h2>' +
            '<div class="block-bg"></div>' +
            '</div>');

        //progress gif
        this.dumpOutput('<div id="ikon_wmb_prgogress" style="color:#ffd100">' +
            'Gathering material data is in progress, please be patient, this could take a minute!' +
            '</div>'
        );

        this.getItemReagents(); //this is the last function call as it is a jsonp callback
    },

    /**
     *
     * @param item_id
     */
    isItemCraftable:function (item_id) {
        var xml_data = jqikon.ajax({
            type:'GET',
            async:false,
            url:'http://www.wowhead.com/item=' + item_id + '&xml',
            dataType:'xml',
            success:function (data, textStatus, jqXHR) {
                if (ikon.wmb.debug) {
                    console.log(data);
                    console.log(textStatus);
                    console.log(jqXHR);
                    console.log(jqikon(data)
                        .find('createdBy>spell:first reagent'));
                }
            },
            error:function (jqXHR, textStatus, errorThrown) {
                if (ikon.wmb.debug) {
                    console.error(jqXHR);
                    console.error(textStatus);
                    console.error(errorThrown);
                }
            }
        }).responseXML;
        return jqikon(xml_data).find('createdBy>spell:first reagent').length > 0 ? true : false;
    },

    /**
     * @private
     */
    displayTierReagents:function () {
        var html = '<div class="listview"><table class="listview-mode-default">';

        var tier = 0;
        for (tier = 0; tier < this.reagents.length; tier++) {
            html += '<thead><tr><th><div><a href="javascript:;"><span>' +
                '<span>TIER ' + tier + '</span>' +
                '</span></a></div></th></tr></thead>' +
                '<tbody><tr>' +
                '<td style="padding-top: 0px; padding-right: 0px; padding-bottom: 0px; padding-left: 0px; ">' +
                '<div style="margin-top: 0px; margin-right: auto; margin-bottom: 0px; margin-left: auto; ">';

            var item = 0;
            for (item = 0; item < this.reagents[tier].length; item++) {
                var r = this.reagents[tier][item];
                html += '<div class="iconmedium" style="float: left; ">' +
                    '<ins style="background-image: url(http://wow.zamimg.com/images/wow/icons/medium/' + r
                    .icon + '.jpg); "></ins>' +
                    '<del></del>' +
                    '<a href="/item=' + r.id + '"></a>' +
                    '<span style="right: 0px; bottom: 0px; position: absolute; " class="glow q1">' +
                    '<div style="position: absolute; white-space: nowrap; left: -1px; top: -1px; color: black; z-index: 2; ">' + r
                    .number + '</div>' +
                    '<div style="position: absolute; white-space: nowrap; left: -1px; top: 0px; color: black; z-index: 2; ">' + r
                    .number + '</div>' +
                    '<div style="position: absolute; white-space: nowrap; left: -1px; top: 1px; color: black; z-index: 2; ">' + r
                    .number + '</div>' +
                    '<div style="position: absolute; white-space: nowrap; left: 0px; top: -1px; color: black; z-index: 2; ">' + r
                    .number + '</div>' +
                    '<div style="position: absolute; white-space: nowrap; left: 0px; top: 0px; z-index: 4; ">' + r
                    .number + '</div>' +
                    '<div style="position: absolute; white-space: nowrap; left: 0px; top: 1px; color: black; z-index: 2; ">' + r
                    .number + '</div>' +
                    '<div style="position: absolute; white-space: nowrap; left: 1px; top: -1px; color: black; z-index: 2; ">' + r
                    .number + '</div>' +
                    '<div style="position: absolute; white-space: nowrap; left: 1px; top: 0px; color: black; z-index: 2; ">' + r
                    .number + '</div>' +
                    '<div style="position: absolute; white-space: nowrap; left: 1px; top: 1px; color: black; z-index: 2; ">' + r
                    .number + '</div>' +
                    '<span style="visibility: hidden; ">' + r.number + '</span>' +
                    '</span>' +
                    '</div>';
            }

            html += '</div>' +
                '</td>' +
                '</tr>' +
                '</tbody>';
        }

        html += '</table></div>';

        this.dumpOutput(html);
    },

    /**
     *
     */
    getItemReagents:function () {
        jqikon.getJSON(this.baseUrl + "wmb.php?callback=?",
            {
                itemid:ikon.wmb.getItemIdFromUrl(document.URL)
            },
            function (data) {
                if (typeof data.error != 'undefined') {
                    alert(data.error);
                }
                else {
                    ikon.wmb.reagents = data;
                    if (ikon.wmb.debug) {
                        console.log(ikon.wmb.reagents);
                    }

                    ikon.wmb.displayTierReagents();
                }
                jqikon('#ikon_wmb_prgogress').remove();
            });

    },

    /**
     *
     * @param html string
     */
    dumpOutput:function (html) {
        if (this.output_element === null) {
            jqikon('<div/>', {
                id:'ikon_wmb_output'
            }).insertBefore(this.getAnchorElement());
            this.output_element = jqikon('#ikon_wmb_output');
        }

        jqikon(this.output_element).append(html);
    }
};
