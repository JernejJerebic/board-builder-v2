
<?php
require_once 'config/database.php';
require_once 'includes/utils.php';
include_once 'includes/header.php';
?>

<div class="space-y-8">
  <div class="text-left">
    <h1 class="text-3xl font-bold mb-2">LCC Naročilo razreza</h1>
    <p class="text-gray-500 text-base mb-2">
      Oblikujte svojo leseno ploščo po meri z izbiro materiala, dimenzij in dodatnih možnosti
    </p>
    <p class="text-sm text-gray-500">
      Za pomoč pri naročilu nas lahko kontaktirate na <span class="font-medium">info@lcc-razrez.si</span> ali po telefonu na <span class="font-medium">040 123 456</span>
    </p>
  </div>
  
  <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
    <div>
      <div id="boardVisualization" class="board-container">
        <!-- Board visualization will be loaded here via JavaScript -->
      </div>
    </div>
    
    <div>
      <div id="boardConfigurator">
        <!-- Board configurator will be loaded here via JavaScript -->
      </div>
    </div>
  </div>
  
  <div id="basket">
    <!-- Basket will be loaded here via JavaScript -->
  </div>
</div>

<script src="/assets/js/board.js"></script>
<script src="/assets/js/configurator.js"></script>
<script src="/assets/js/basket.js"></script>

<?php include_once 'includes/footer.php'; ?>
