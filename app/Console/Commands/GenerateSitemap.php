<?php

namespace App\Console\Commands;

use App\Models\BibleVersion;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\File;

class GenerateSitemap extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:generate-sitemap';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Generate the sitemap.xml file';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Generating sitemap...');

        $baseUrl = config('app.url');
        $sitemap = '<?xml version="1.0" encoding="UTF-8"?>';
        $sitemap .= '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">';

        // Home
        $sitemap .= $this->addUrl($baseUrl . '/', 'daily', '1.0');

        // Bible Chapters
        // Assuming single version for now, or primary version
        $version = BibleVersion::first();
        
        if ($version) {
            $books = $version->books()->with('chapters')->get();

            foreach ($books as $book) {
                // Book Index (if exists) or just chapters
                $sitemap .= $this->addUrl($baseUrl . "/bible/{$book->abbreviation}", 'weekly', '0.8');

                foreach ($book->chapters as $chapter) {
                    $sitemap .= $this->addUrl($baseUrl . "/bible/{$book->abbreviation}/{$chapter->number}", 'monthly', '0.7');
                }
            }
        }

        $sitemap .= '</urlset>';

        File::put(public_path('sitemap.xml'), $sitemap);

        $this->info('Sitemap generated successfully at public/sitemap.xml');
    }

    private function addUrl($loc, $freq, $priority)
    {
        return "
    <url>
        <loc>{$loc}</loc>
        <changefreq>{$freq}</changefreq>
        <priority>{$priority}</priority>
    </url>";
    }
}
