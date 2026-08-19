import Papa from 'papaparse';
import JSZip from 'jszip';
import { StockPlatform, UploadedMediaItem } from '../types/metadata';
import { STOCK_PLATFORMS } from '../data/platformTemplates';

export class CsvExportService {
  /**
   * Format metadata rows according to the target stock agency's CSV template
   */
  static generateCsvContent(platformId: StockPlatform, items: UploadedMediaItem[]): string {
    const completedItems = items.filter(item => item.status === 'completed' && item.metadata);
    if (completedItems.length === 0) {
      throw new Error('No completed metadata items to export.');
    }

    const platform = STOCK_PLATFORMS[platformId] || STOCK_PLATFORMS['adobe-stock'];
    let dataRows: Record<string, string>[] = [];

    switch (platformId) {
      case 'adobe-stock':
        dataRows = completedItems.map(item => {
          const meta = item.metadata!;
          // Adobe Stock allows up to 49 keywords, comma-separated
          const keywordsStr = meta.keywords.slice(0, 49).join(', ');
          return {
            'Filename': item.fileName,
            'Title': meta.title,
            'Keywords': keywordsStr,
            'Category': meta.category || 'General'
          };
        });
        break;

      case 'shutterstock':
        dataRows = completedItems.map(item => {
          const meta = item.metadata!;
          const keywordsStr = meta.keywords.slice(0, 50).join(', ');
          return {
            'Filename': item.fileName,
            'Description': meta.description || meta.title,
            'Keywords': keywordsStr,
            'Categories': meta.category || 'General'
          };
        });
        break;

      case 'freepik':
        dataRows = completedItems.map(item => {
          const meta = item.metadata!;
          const tagsStr = meta.keywords.slice(0, 50).join(', ');
          return {
            'Filename': item.fileName,
            'Title': meta.title.length > 100 ? meta.title.substring(0, 97) + '...' : meta.title,
            'Tags': tagsStr
          };
        });
        break;

      case 'vecteezy':
        dataRows = completedItems.map(item => {
          const meta = item.metadata!;
          const keywordsStr = meta.keywords.slice(0, 50).join(', ');
          return {
            'Filename': item.fileName,
            'Title': meta.title,
            'Description': meta.description || meta.title,
            'Keywords': keywordsStr,
            'License': 'Standard'
          };
        });
        break;

      case '123rf':
        dataRows = completedItems.map(item => {
          const meta = item.metadata!;
          const keywordsStr = meta.keywords.slice(0, 50).join(', ');
          return {
            'Filename': item.fileName,
            'Description': meta.description || meta.title,
            'Keywords': keywordsStr,
            'Country': 'Global'
          };
        });
        break;

      case 'pond5':
        dataRows = completedItems.map(item => {
          const meta = item.metadata!;
          const keywordsStr = meta.keywords.slice(0, 50).join(', ');
          return {
            'Filename': item.fileName,
            'Title': meta.title,
            'Description': meta.description || meta.title,
            'Keywords': keywordsStr,
            'City': '',
            'State': '',
            'Country': ''
          };
        });
        break;

      case 'depositphotos':
        dataRows = completedItems.map(item => {
          const meta = item.metadata!;
          const keywordsStr = meta.keywords.slice(0, 50).join(', ');
          return {
            'Filename': item.fileName,
            'Description': meta.description || meta.title,
            'Keywords': keywordsStr
          };
        });
        break;

      case 'istock':
        dataRows = completedItems.map(item => {
          const meta = item.metadata!;
          const keywordsStr = meta.keywords.slice(0, 50).join(', ');
          return {
            'Filename': item.fileName,
            'Title': meta.title,
            'Description': meta.description || meta.title,
            'Keywords': keywordsStr
          };
        });
        break;

      case 'canva':
        dataRows = completedItems.map(item => {
          const meta = item.metadata!;
          const keywordsStr = meta.keywords.slice(0, 50).join(', ');
          return {
            'Filename': item.fileName,
            'Title': meta.title,
            'Keywords': keywordsStr
          };
        });
        break;

      case 'general':
      default:
        dataRows = completedItems.map(item => {
          const meta = item.metadata!;
          const keywordsStr = meta.keywords.join(', ');
          return {
            'Filename': item.fileName,
            'Title': meta.title,
            'Description': meta.description || meta.title,
            'Keywords': keywordsStr,
            'Category': meta.category || 'General',
            'ContentType': item.fileType
          };
        });
        break;
    }

    return Papa.unparse(dataRows, {
      quotes: true,
      header: true
    });
  }

  /**
   * Download a single CSV file for the selected platform
   */
  static downloadPlatformCsv(platformId: StockPlatform, items: UploadedMediaItem[]): void {
    const csvContent = this.generateCsvContent(platformId, items);
    const platform = STOCK_PLATFORMS[platformId];
    const timestamp = new Date().toISOString().slice(0, 10);
    const filename = `${platform.name.toLowerCase().replace(/\s+/g, '_')}_metadata_${timestamp}.csv`;

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  /**
   * Export all platform CSVs inside a single ZIP file
   */
  static async exportAllPlatformsZip(items: UploadedMediaItem[]): Promise<void> {
    const zip = new JSZip();
    const platforms: StockPlatform[] = [
      'adobe-stock',
      'shutterstock',
      'freepik',
      'vecteezy',
      '123rf',
      'depositphotos',
      'istock',
      'canva',
      'general'
    ];

    for (const plat of platforms) {
      try {
        const csvContent = this.generateCsvContent(plat, items);
        const platform = STOCK_PLATFORMS[plat];
        const filename = `${platform.name.toLowerCase().replace(/\s+/g, '_')}_metadata.csv`;
        zip.file(filename, csvContent);
      } catch {
        // Skip empty
      }
    }

    const zipBlob = await zip.generateAsync({ type: 'blob' });
    const timestamp = new Date().toISOString().slice(0, 10);
    const zipFilename = `metadatagen_all_platforms_${timestamp}.zip`;

    const url = URL.createObjectURL(zipBlob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', zipFilename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}
