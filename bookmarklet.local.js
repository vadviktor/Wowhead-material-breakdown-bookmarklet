(function()
{
    function disassemble()
    {
        jqikon.getScript( 'http://localhost/wmb/wmb.js', function()
        {
            ikon.wmb.disassemble();
        } );
    }

    (function( W, D, C, $, V, H, S, s, d )
    {
        if ( !($ = W.jqikon || W.jQuery) || (V = $.fn.jquery) < 'ikon' || V > 'Z' || C( $ ) )
        {
            H = D.getElementsByTagName( 'head' )[0];
            S = D.createElement( 'script' );
            S.type = 'text/javascript';
            S.src = 'http://code.jquery.com/jquery-latest.min.js';
            S.onload = S.onreadystatechange = function()
            {
                if ( !d && (!(s = this.readyState) || s == 'loaded' || s == 'complete') )
                {
                    d = 1;
                    W.jqikon = $ = W.jQuery.noConflict( 1 );
                    C( $ );
                    H.removeChild( S );

                    disassemble();
                }
            };
            H.appendChild( S );
        }
    })( window, document, function( $ )
    {
    } );
})();
