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
     * reagents [ tier ] [ item id ] {
     *                                   name
     *                                   icon
     *                                   count
     *                               }
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
        for ( var i = 0; i < j_h2s; i++ )
        {
            if ( jqikon( h2s[i] ).text() == 'Contribute' )
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
        if ( jqikon( '#ikon_wmb_output' ).length == 1 )
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
                         '<h2 id="ikon_wmb_header" class="clear">Material breakdown [processing]</h2>' +
                         '<div class="block-bg"></div>' +
                         '</div>' );

        this.dumpItemReagentsRecursive( this.getItemIdFromUrl( url ), 0 );
    },

    /**
     *
     * @param item_id [string|integer]
     * @param tier [string|integer]
     */
    dumpItemReagentsRecursive : function( item_id, tier )
    {
        var r = this.getItemReagents( item_id );
    },

    /**
     *
     * @param item_id [string|integer]
     */
    getItemReagents : function( item_id )
    {
        jqikon.ajax( {
                         type : 'GET',
                         url : 'http://www.wowhead.com/item=' + item_id + '&xml',
                         dataType: 'xml',
                         success: function( data, textStatus, jqXHR )
                         {
                             if ( ikon.wmb.debug_c )
                             {
                                 console.log( data );
                                 console.log( textStatus );
                                 console.log( jqXHR );
                                 console.log( jqikon( data ).find( 'createdBy>spell reagent' ) );
                             }
                             if ( jqikon( data ).find( 'createdBy>spell reagent' ) )
                             {

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
                     } );
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
