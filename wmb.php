<?php

require_once __DIR__ . '/phpQuery.php';

/**
 *
 */
class WowheadMaterialBreakdown
{
    /**
     * @var array
     */
    private $reagents = array();

    /**
     * Materials that should not be broken apart any further.
     *
     * @var array
     */
    private $non_craftables = array(
        22572, //mote of air
        22573, //mote of earth
        22574, //mote of fire
        22575, //mote of life
        22576, //mote of mana
        22577, //mote of shadow
        22578, //mote of water

        37700, //crystallized air
        37701, //crystallized earth
        37702, //crystallized fire
        37704, //crystallized life
        37703, //crystallized shadow
        37705, //crystallized water

        7080, //essence of water
        7078, //essemce of fire
        12808, //essence of undeath
        7076, //essence of earth
        7082, //essence of air
        12803, //eliving essence

        18582, //Azzinoth
        18583, //Azzinoth
        18584, //Azzinoth
        9372, //Sul'thraze the Lasher
        6948, //Hearthstone

        22448, //Small Prismatic Shard
        10998, //Lesser Astral Essence
        22447, //Lesser Planar Essence
        16202, //Lesser Eternal Essence
        10938, //Lesser Magic Essence
        11134, //Lesser Mystic Essence
        11174, //Lesser Nether Essence
        52718, //Lesser Celestial Essence
        34056, //Lesser Cosmic Essence

    );

    /**
     * $reagent_corrections[ item_id ][ reagent_id ] = correct_value
     *
     * @var array
     */
    private $reagent_corrections = array(
        21886 => array( 22575 => 10 ), //primal life
        22452 => array( 22573 => 10 ), //primal earth
        22457 => array( 22576 => 10 ), //primal mana
        22456 => array( 22577 => 10 ), //primal shadow
        21885 => array( 22578 => 10 ), //primal water
        22451 => array( 22572 => 10 ), //primal air
        21884 => array( 22574 => 10 ), //primal fire

        35627 => array( 37703 => 10 ), //eternal shadow
        35624 => array( 37701 => 10 ), //eternal earth
        35623 => array( 37700 => 10 ), //eternal air
        35622 => array( 37705 => 10 ), //eternal water
        35625 => array( 37704 => 10 ), //eternal life
        36860 => array( 37702 => 10 ), //eternal fire
    );

    /**
     * @param $item_id
     * @param $reagent
     * @return int|bool
     */
    protected function itemNeedsReagentNumberCorrection( $item_id, $reagent )
    {
        if ( isset( $this->reagent_corrections[ $item_id ] ) )
        {
            $r_id = (int) pq( $reagent )->attr( 'id' );
            if ( isset( $this->reagent_corrections[ $item_id ][ $r_id ] ) )
            {
                return $this->reagent_corrections[ $item_id ][ $r_id ];
            }
        }

        return false;
    }

    /**
     * @param $item_id
     * @param int $tier
     * @param int $parent_count
     * @return void
     */
    protected function getReagents( $item_id, $tier = 0, $parent_count = 1 )
    {
        //something must have gotten into recursion
        if ( $tier >= 10 )
        {
            $this->returnData(
                json_encode( array
                             ( 'error' => "Some reagent got into recursion. Please submit a ticket on the project's website." )
                )
            );
        }

        $reagents = $this->getItemReagents( $item_id );
        $reagents_count = count( $reagents );
        if ( $reagents_count > 0 && !in_array( $item_id, $this->non_craftables ) )
        {
            for ( $i = 0; $i < $reagents_count; $i++ )
            {
                $overrideItemReagentCount = $this->itemNeedsReagentNumberCorrection( $item_id,
                                                                                     $reagents[ $i ]
                );
                $r_info = $this->addReagentToTier( $reagents[ $i ], $tier, $parent_count,
                                                   $overrideItemReagentCount
                );
                $this->getReagents( $r_info[ 'id' ], $tier + 1, $r_info[ 'number' ] );
            }
        }
        else
        {
            if ( $tier > 0 )
            {
                $tier--;
            }

            $r = &$this->getItemByIdInTier( $tier, $item_id );
            if ( !is_null( $r ) )
            {
                $r[ 'craftable' ] = false;
            }
        }
    }

    /**
     * @param $reagent
     * @param $tier
     * @param int $parent_count
     * @param int|false $overrideItemReagentCount
     * @return string item id
     */
    protected function addReagentToTier( $reagent, $tier, $parent_count, $overrideItemReagentCount )
    {
        $r_id = pq( $reagent )->attr( 'id' );
        $r_name = pq( $reagent )->attr( 'name' );
        $r_icon = strtolower( pq( $reagent )->attr( 'icon' ) );

        if ( !$overrideItemReagentCount )
        {
            $r_count = (int) pq( $reagent )->attr( 'count' );
        }
        else
        {
            $r_count = $overrideItemReagentCount;
        }
        $r_count *= $parent_count;

        if ( !isset( $this->reagents[ $tier ] ) )
        {
            $this->reagents[ $tier ] = array();
        }

        $r = &$this->getItemByIdInTier( $tier, $r_id );
        if ( !isset( $r ) )
        {
            $this->reagents[ $tier ][ ] = array(
                'id' => $r_id,
                'name' => $r_name,
                'icon' => $r_icon,
                'number' => $r_count,
                'craftable' => true
            );
        }
        else
        {
            $r[ 'number' ] += $r_count;
        }

        return array( 'id' => $r_id, 'number' => $r_count );
    }

    /**
     * @param $tier
     * @param $item_id
     * @return bool|array
     */
    protected function &getItemByIdInTier( $tier, $item_id )
    {
        $c = count( $this->reagents[ $tier ] );
        for ( $i = 0; $i < $c; $i++ )
        {
            if ( $this->reagents[ $tier ][ $i ][ 'id' ] == $item_id )
            {
                return $this->reagents[ $tier ][ $i ];
            }
        }

        $n = null;
        return $n;
    }

    /**
     * @param $url
     * @return mixed
     */
    protected function get_data( $url )
    {
        $ch = curl_init();
        $timeout = 5;
        curl_setopt( $ch, CURLOPT_URL, $url );
        curl_setopt( $ch, CURLOPT_RETURNTRANSFER, 1 );
        curl_setopt( $ch, CURLOPT_CONNECTTIMEOUT, $timeout );
        $data = curl_exec( $ch );
        curl_close( $ch );
        return $data;
    }

    /**
     * @param $item_id
     * @return array|DOMElement
     */
    protected function getItemReagents( $item_id )
    {
        usleep( 500000 );
        //$xml_data = file_get_contents( "http://www.wowhead.com/item={$item_id}&xml" );
        $xml_data = $this->get_data( "http://www.wowhead.com/item={$item_id}&xml" );
        if ( $xml_data )
        {
            $reagents = phpQuery::newDocumentXML( $xml_data )
                ->find( 'createdBy>spell:first reagent' )
                ->get();
            return $reagents;
        }
        else
        {
            return array();
        }
    }

    /**
     * Copy non-craftable reagents to lower tiers as well to show a correct sum of that tier.
     *
     * @return void
     */
    protected function distibuteReagentsToLowerTiers()
    {
        $count_tiers = count( $this->reagents ) - 1; //-1 as we don't want to check the last tier
        for ( $tier = 0; $tier < $count_tiers; $tier++ )
        {
            foreach ( $this->reagents[ $tier ] as $reagent )
            {
                if ( $reagent[ 'craftable' ] == false )
                {
                    $this->reagents[ $tier + 1 ][ ] = $reagent;
                }
            }
        }
    }

    /**
     * main()
     *
     * @return void
     */
    public function disassemble()
    {
        if ( is_numeric( $_GET[ 'itemid' ] ) )
        {
            ini_set( 'max_execution_time', '90' );

            $this->getReagents( $_GET[ 'itemid' ] );
            $this->distibuteReagentsToLowerTiers();

            $json = json_encode( $this->reagents );

            $this->returnData( $json );
        }
        else
        {
            $this->returnData( array( 'error' => 'Item ID is not a numberic value' ) );
        }
    }

    protected function returnData( $json )
    {
        if ( $_GET[ 'callback' ] )
        {
            print $_GET[ 'callback' ] . "({$json});";
        }
        else
        {
            print $json;
        }

        exit;
    }

    /**
     * @static
     * @return WowheadMaterialBreakdown
     */
    public static function create()
    {
        return new WowheadMaterialBreakdown();
    }
}

WowheadMaterialBreakdown::create()->disassemble();
