import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { IDeployerVMAdd } from 'tapioca-sdk/dist/ethers/hardhat/DeployerVM';

import { SeerCLSolo__factory } from '@typechain/index';
import { DEPLOYMENT_NAMES, DEPLOY_CONFIG } from 'tasks/deploy/DEPLOY_CONFIG';

export const buildDaiOracle = async (
    hre: HardhatRuntimeEnvironment,
): Promise<IDeployerVMAdd<SeerCLSolo__factory>> => {
    console.log('[+] buildDaiOracle');

    const chainID = hre.SDK.eChainId;
    if (chainID !== hre.SDK.config.EChainID.MAINNET) {
        throw '[-] DAI Oracle only available on Ethereum';
    }
    const deployer = (await hre.ethers.getSigners())[0];

    const args: Parameters<SeerCLSolo__factory['deploy']> = [
        'DAI/USD', // Name
        'DAI/USD', // Symbol
        18, // Decimals
        {
            _poolChainlink:
                DEPLOY_CONFIG.POST_LBP[chainID]!.DAI_USD_CL_DATA_FEED_ADDRESS, // CL Pool
            _isChainlinkMultiplied: 1, // Multiply/divide Uni
            _inBase: (1e18).toString(), // In base
            stalePeriod: 86400, // CL stale period, 1 day
            guardians: [deployer.address], // Guardians
            _description: hre.ethers.utils.formatBytes32String('DAI/USD'), // Description,
            _sequencerUptimeFeed: hre.ethers.constants.AddressZero, // CL Sequencer
            _admin: deployer.address, // Owner
        },
    ];

    return {
        contract: await hre.ethers.getContractFactory('SeerCLSolo'),
        deploymentName: DEPLOYMENT_NAMES.DAI_ORACLE,
        args,
    };
};
