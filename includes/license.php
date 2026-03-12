<?php
if (! defined('ABSPATH')) {
	exit; // Exit if accessed directly
}

$products = $this->products;

function isActive($key, $products)
{
	return ($products[$key]['active'] ?? false) && !($products[$key]['fs'] ?? false);
}

function render_license_form($products, $key, $addon)
{
	$value = isset($products[$key]['key']) ? $products[$key]['key'] : '';
	$addon_name = isset($addon['name']) ? $addon['name'] : '';

	$display_activate = empty($value) ? '' : 'display: none;';
	$display_deactivate = !empty($value) ? '' : 'display: none;';

?>
<form method="post" id="form-<?php echo esc_attr($key); ?>" class="addon-license-form">
	<table class="form-table">
		<tr valign="top">
			<th scope="row"><?php echo esc_html($addon_name); ?></th>
			<td>
				<input type="text" id="<?php echo esc_attr($key); ?>_license"
					name="<?php echo esc_attr($key); ?>_license" value="<?php echo esc_attr($value); ?>"
					placeholder="<?php echo esc_attr__('Enter License Code', 'real3d-flipbook'); ?>"
					style="width: 320px;" />
				<input type="button" id="activate-<?php echo esc_attr($key); ?>" class="button button-primary"
					value="<?php echo esc_attr__('Activate', 'real3d-flipbook'); ?>"
					style="<?php echo esc_attr($display_activate); ?>" <?php echo empty($value) ? '' : 'disabled'; ?> />
				<input type="button" id="deactivate-<?php echo esc_attr($key); ?>" class="button button-primary"
					value="<?php echo esc_attr__('Deactivate', 'real3d-flipbook'); ?>"
					style="<?php echo esc_attr($display_deactivate); ?>" />
			</td>
		</tr>
	</table>
</form>
<?php
}



?>
<div class="wrap">
	<h1><?php esc_html_e('License Settings', 'real3d-flipbook'); ?></h1>
	<p><?php esc_html_e("This page allows you to activate or deactivate your Real3D Flipbook and addons licenses.", 'real3d-flipbook'); ?>
	<p><?php esc_html_e("Please enter your Envato license codes to activate your licenses.", 'real3d-flipbook'); ?>
	</p>
	<?php
	// Render form for the main Real3D Flipbook product
	render_license_form($products, 'r3d', ['name' => 'Real3D Flipbook']);

	$addons_form = false;
	foreach ($products as $key => $addon) {
		if (isActive($key, $products)) {
			if (!$addons_form) {
				render_license_form($products, 'addons', ['name' => 'Addons Bundle']);
				$addons_form = true;
			}
			render_license_form($products, $key, $addon);
		}
	}
	?>
	<div>
		<a href="<?php echo esc_url('https://help.market.envato.com/hc/en-us/articles/202822600-Where-Is-My-Purchase-Code'); ?>"
			target="_blank"><?php esc_html_e('Where can I find my License Code?', 'real3d-flipbook'); ?></a>


	</div>

</div>
<?php
$r3d_nonce = wp_create_nonce('r3d_nonce');

wp_enqueue_script("real3d-flipbook-license", $this->PLUGIN_DIR_URL . "js/license.js", array('jquery'), $this->PLUGIN_VERSION, true);
wp_localize_script('real3d-flipbook-license', 'r3d_ajax', array('nonce' => $r3d_nonce));
?>