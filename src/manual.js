import MetaJob from './jobs/meta-job.js';
import GoogleJob from './jobs/google-job.js';
import { adsMappingJob, combinedReportJob, meliJob, runAllMiscJobs } from './jobs/misc-jobs.js';
import { updateAllData } from './index.js';
import logger from './utils/logger.js';

// mapa: nombre por CLI -> funcion a ejecutar
const PROCESSES = {
  // meta / instagram
  'instagram-by-day': MetaJob.processInstagramByDay,
  'instagram-posts': MetaJob.processInstagramPosts,
  'instagram-stories': MetaJob.processInstagramStories,
  'meta-report': MetaJob.processMetaReport,
  'meta-all': MetaJob.runAll,

  // google
  'google-channel': GoogleJob.processGoogleChannel,
  'utm-aliados': GoogleJob.processUTMAliados,
  'users-by-day': GoogleJob.processUsersByDay,
  'sales-funnel': GoogleJob.processSalesFunnel,
  'google-report': GoogleJob.processGoogleReport,
  'google-rebuild-historical': GoogleJob.rebuildHistoricalCampaigns,
  'google-all': GoogleJob.runAll,

  // misc
  'ads-mapping': adsMappingJob,
  'combined-report': combinedReportJob,
  'meli': meliJob,
  'misc-all': runAllMiscJobs,

  // todo
  'all': updateAllData,
};

function printUsage() {
  console.log('\nUso: node src/manual.js <proceso>\n');
  console.log('Procesos disponibles:\n');
  console.log('  Meta / Instagram');
  console.log('    instagram-by-day     Instagram por dia');
  console.log('    instagram-posts      Instagram posts');
  console.log('    instagram-stories    Instagram stories');
  console.log('    meta-report         Meta report (incremental)');
  console.log('    meta-all            Todos los jobs de Meta\n');
  console.log('  Google');
  console.log('    google-channel      Channel report');
  console.log('    utm-aliados         UTM aliados');
  console.log('    users-by-day        Users by day');
  console.log('    sales-funnel       Sales funnel');
  console.log('    google-report      Google paid report (incremental)');
  console.log('    google-rebuild-historical  Rebuild campañas históricas');
  console.log('    google-all         Todos los jobs de Google\n');
  console.log('  Misc');
  console.log('    ads-mapping        Ads mapping');
  console.log('    combined-report    Combined report by day');
  console.log('    meli               Mercado Libre (incremental)');
  console.log('    misc-all           Todos los misc jobs\n');
  console.log('  Todo');
  console.log('    all                Ejecuta todo (meta + google + misc)\n');
}

async function main() {
  const processName = process.argv[2];

  if (!processName || processName === '--help' || processName === '-h' || processName === '--list' || processName === '-l') {
    printUsage();
    process.exit(0);
  }

  const fn = PROCESSES[processName];
  if (!fn) {
    console.error(`Proceso desconocido: "${processName}"`);
    console.error('Usa --list o -l para ver procesos disponibles.');
    process.exit(1);
  }

  logger.info(`Ejecutando proceso: ${processName}`);
  try {
    await fn();
    logger.success(`Proceso "${processName}" finalizado correctamente`);
    process.exit(0);
  } catch (error) {
    logger.error(`Error en proceso "${processName}"`, error);
    process.exit(1);
  }
}

main();
