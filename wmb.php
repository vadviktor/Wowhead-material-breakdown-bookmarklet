<?php

require_once __DIR__ . '/wowhead_material_breakdown.php';

WowheadMaterialBreakdown::create()->echoDisassembleData($_GET['itemid']);
