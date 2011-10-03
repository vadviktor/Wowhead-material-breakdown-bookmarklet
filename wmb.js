var ikon = {};
ikon.wmb = {

    /**
     * Visual alerts
     *
     * @private
     * @type boolean
     */
    debug_v : true,

    /**
     * Console debug messages
     *
     * @private
     * @type boolean
     */
    debug_c : true,

    /**
     * Output div
     *
     * @private
     * @type object
     */
    output_element : null,

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
    reagents : [],

    /**
     *
     * @private
     * @return object
     */
    getAnchorElement : function()
    {
        var h2s = jqikon( "h2[class*='clear']" );
        var j_h2s = h2s.length;
        var i = 0;
        for ( i = 0; i < j_h2s; i++ )
        {
            if ( jqikon( h2s[i] ).text() === 'Contribute' )
            {
                return jqikon( h2s[i] ).parent();
            }
        }
        //error
        var msg = "No element found as an output anchor";
        if ( this.debug_v )
        {
            alert( msg );
        }
        if ( this.debug_c )
        {
            console.error( msg );
        }
    },

    /**
     *
     * @public
     * @return string
     * @param url
     */
    getItemIdFromUrl : function( url )
    {
        var r = /item=[0-9]{1,}/;
        var m = url.match( r );
        var s = m[0].split( '=' );
        return s[1];
    },

    /**
     * Main entry point
     *
     * @public
     * @param url string
     */
    disassemble : function( url )
    {
        //launch only once
        if ( jqikon( '#ikon_wmb_output' ).length === 1 )
        {
            var msg = "Material breakdown already launched";
            if ( this.debug_c )
            {
                console.warn( msg );
            }
            if ( this.debug_v )
            {
                alert( msg );
            }
            return;
        }

        //header
        this.dumpOutput( '<div class="text">' +
                         '<h2 id="ikon_wmb_header" class="clear">Material breakdown (processing)</h2>' +
                         '<div class="block-bg"></div>' +
                         '</div>' );

        this.gatherItemReagentsRecursive( this.getItemIdFromUrl( url ), 0 );

        /** @todo copy non craftables to lower tiers  */

        if ( this.debug_c )
        {
            console.log( this.reagents );
        }

        //this.displayTierReagents();

        jqikon( '#ikon_wmb_header' ).text( 'Material breakdown' );
    },

    /**
     * @private
     */
    displayTierReagents : function()
    {
        var tier = 0;
        for ( tier = 0; tier < this.reagents.length; tier++ )
        {
            var item = 0;
            for ( item = 0; item < this.reagents[tier].length; item++ )
            {
                var r = this.reagents[tier][item];
                console.log( r );
//                var html = '<div class="iconmedium" style="float: left; ">' +
//                           '<ins style="background-image: url(http://wow.zamimg.com/images/wow/icons/medium/' + r
//                    .icon + '.jpg); "></ins>' +
//                           '<del></del>' +
//                           '<a href="/item=' + item + '"></a>' +
//                           '<span style="right: 0px; bottom: 0px; position: absolute; " class="glow q1">' +
//                           '<div style="position: absolute; white-space: nowrap; left: -1px; top: -1px; color: black; z-index: 2; ">' + r
//                    .number + '</div>' +
//                           '<div style="position: absolute; white-space: nowrap; left: -1px; top: 0px; color: black; z-index: 2; ">' + r
//                    .number + '</div>' +
//                           '<div style="position: absolute; white-space: nowrap; left: -1px; top: 1px; color: black; z-index: 2; ">' + r
//                    .number + '</div>' +
//                           '<div style="position: absolute; white-space: nowrap; left: 0px; top: -1px; color: black; z-index: 2; ">' + r
//                    .number + '</div>' +
//                           '<div style="position: absolute; white-space: nowrap; left: 0px; top: 0px; z-index: 4; ">' + r
//                    .number + '</div>' +
//                           '<div style="position: absolute; white-space: nowrap; left: 0px; top: 1px; color: black; z-index: 2; ">' + r
//                    .number + '</div>' +
//                           '<div style="position: absolute; white-space: nowrap; left: 1px; top: -1px; color: black; z-index: 2; ">' + r
//                    .number + '</div>' +
//                           '<div style="position: absolute; white-space: nowrap; left: 1px; top: 0px; color: black; z-index: 2; ">' + r
//                    .number + '</div>' +
//                           '<div style="position: absolute; white-space: nowrap; left: 1px; top: 1px; color: black; z-index: 2; ">' + r
//                    .number + '</div>' +
//                           '<span style="visibility: hidden; ">' + r.number + '</span>' +
//                           '</span>' +
//                           '</div>'
//                this.dumpOutput( html );
            }
        }
    },

    /**
     *
     * @param item_id string
     * @param tier string|integer
     */
    gatherItemReagentsRecursive : function( item_id, tier )
    {
        tier = parseInt( tier );

        var reagents = this.getItemReagents( item_id );
        var reagents_count = reagents.length;
        if ( reagents_count > 0 )
        {
            var i = 0;
            for ( i = 0; i < reagents_count; i++ )
            {
                var r_id = this.addReagentToTier( reagents[i], tier );
                this.gatherItemReagentsRecursive( r_id, tier + 1 );
            }
        }
        else
        {
            if ( tier > 0 )
            {
                tier--;
            }

            var r = this.getItemByIdInTier( tier, item_id );
            r.craftable = false;
        }
    },

    /**
     *
     *
     * @param reagent object
     * @param tier string|integer
     * @param craftable booelan [true]
     * @return itemid integer|string
     */
    addReagentToTier : function( reagent, tier )
    {
        tier = parseInt( tier );

        var r_id = jqikon( reagent ).attr( 'id' ).toString();
        var r_name = jqikon( reagent ).attr( 'name' );
        var r_icon = jqikon( reagent ).attr( 'icon' ).toLowerCase();
        var r_count = parseInt( jqikon( reagent ).attr( 'count' ) );

        if ( typeof this.reagents[tier] === 'undefined' )
        {
            this.reagents[tier] = [];
        }

        if ( ! this.getItemByIdInTier( tier, r_id ) )
        {
            this.reagents[tier].push( {
                                          id : r_id,
                                          name : r_name,
                                          icon : r_icon,
                                          number : r_count,
                                          craftable: true
                                      } );
        }
        else
        {
            var r = this.getItemByIdInTier( tier, r_id );
            r.number += r_count;
        }

        return r_id;
    },

    /**
     * Search for an item in a tier
     *
     * @param tier string|integer
     * @param item_id string|integer
     * @return boolean|object false if not found
     */
    getItemByIdInTier : function( tier, item_id )
    {
        tier = parseInt( tier );

        var i = 0;
        for ( i = 0; i < this.reagents[tier].length; i++ )
        {
            if ( this.reagents[tier][i].id == item_id )
            {
                return this.reagents[tier][i];
            }
        }

        return false;
    },

    /**
     *
     * @param item_id string|integer
     */
    getItemReagents : function( item_id )
    {
        var xml_data = jqikon.ajax( {
                                        type : 'GET',
                                        async : false,
                                        url : 'http://www.wowhead.com/item=' + item_id + '&xml',
                                        dataType: 'xml',
                                        success: function( data, textStatus, jqXHR )
                                        {
                                            if ( ikon.wmb.debug_c )
                                            {
                                                console.log( data );
                                                console.log( textStatus );
                                                console.log( jqXHR );
                                                console.log( jqikon( data )
                                                                 .find( 'createdBy>spell:first reagent' ) );
                                            }
                                        },
                                        error: function( jqXHR, textStatus, errorThrown )
                                        {
                                            if ( ikon.wmb.debug_c )
                                            {
                                                console.error( jqXHR );
                                                console.error( textStatus );
                                                console.error( errorThrown );
                                            }
                                        }
                                    } ).responseXML;
        return jqikon( xml_data ).find( 'createdBy>spell:first reagent' );
    },

    /**
     *
     * @param html string
     */
    dumpOutput : function( html )
    {
        if ( this.output_element === null )
        {
            jqikon( '<div/>', {
                id: 'ikon_wmb_output'
            } ).insertBefore( this.getAnchorElement() );
            this.output_element = jqikon( '#ikon_wmb_output' );
        }

        jqikon( this.output_element ).append( html );
    }
};
