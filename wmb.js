var ikon = {};
ikon.wmb = {
    debug_v : true, //visual alerts
    debug_c : true, //console debug messages
    output_element : null,

    getAnchorElement : function()
    {
        var h2s = jqikon( "h2[class*='clear']" );
        var j_h2s = h2s.length;
        for ( i = 0; i < j_h2s; i++ )
        {
            if ( jqikon( h2s[i] ).text() == 'Contribute' )
            {
                return jqikon( h2s[i] ).parent();
            }
        }
        this.errorNoAnchorElementFound();
    },

    errorNoAnchorElementFound : function()
    {
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

    getOutputElement : function()
    {
        if ( this.output_element === null )
        {
            jqikon('<div/>', {
                id: 'ikon_wmb_output'
            }).insertBefore( this.getAnchorElement() );
            this.output_element = jqikon( '#ikon_wmb_output' );
        }

        return this.output_element;
    },

    //main entry point
    disassemble : function( url )
    {
        this.dumpOutput( '<h1>wazeeeeeee</h1>' );
    },


//    getItemXml : function(item_id) {
//        //return 'http//localhost/?url=http://www.wowhead.com/item=' + item_id + '&xml';
//
//    },

    dumpOutput : function( html )
    {
        jqikon( this.getOutputElement() ).append( html );
    }
};
