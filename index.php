
<?php
require_once 'config/database.php';
require_once 'includes/utils.php';
include_once 'includes/header.php';
?>

<div class="space-y-8 py-8">
  <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
    <div class="text-left space-y-4">
      <h1 class="text-3xl font-bold text-primary">LCC Naročilo razreza</h1>
      <p class="text-lg text-gray-500">
        Oblikujte svojo leseno ploščo po meri z izbiro materiala, dimenzij in dodatnih možnosti.
      </p>
      <div class="p-4 bg-secondary-color rounded-lg border border-border-color">
        <p class="text-base">
          Za pomoč pri naročilu nas lahko kontaktirate na:
        </p>
        <p class="mt-2">
          <span class="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
            </svg>
            <span class="font-medium">+386 7 393 07 00</span>
          </span>
        </p>
        <p class="mt-2">
          <span class="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
              <polyline points="22,6 12,13 2,6"></polyline>
            </svg>
            <span class="font-medium">info@lcc.si</span>
          </span>
        </p>
      </div>
    </div>
    <div class="flex justify-center">
      <img src="https://www.lcc.si/wp-content/uploads/2020/03/Logo-COREL-Brez-ozadja-2-1024x462-1.png" alt="LCC" class="max-w-full h-auto" style="max-height: 200px;">
    </div>
  </div>
  
  <div>
    <div class="card">
      <div class="card-header">
        <h2 class="text-xl font-semibold">Konfigurator</h2>
      </div>
      <div class="card-body">
        <div id="boardConfigurator">
          <!-- Board configurator will be loaded here via JavaScript -->
        </div>
      </div>
    </div>
  </div>
  
  <div class="card">
    <div class="card-header">
      <h2 class="text-xl font-semibold">Košarica</h2>
    </div>
    <div class="card-body">
      <div id="basket">
        <!-- Basket will be loaded here via JavaScript -->
      </div>
    </div>
  </div>
</div>

<script src="/assets/js/configurator.js"></script>
<script src="/assets/js/basket.js"></script>

<?php include_once 'includes/footer.php'; ?>
