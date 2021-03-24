import ProfileModel from 'datalayer/models/mongo/profile.model';
import { ProfileType, } from 'types/profile.types';
class PARSING {
  async validateIfExistProfile(linkedinUrl: string): Promise<boolean> {
    const querySearch = { linkedinUrl, };

    const profile = await ProfileModel.findOne(querySearch).lean();
    if(!profile) return false;

    return true;
  }

  async updateProfile(linkedinUrl: string, documentsWithParamsToUpdate: ProfileType): Promise<ProfileType> {
    try {
      const querySearch = {
        linkedinUrl,
      };

      const queryUpdate = {
        $set: {
          ...documentsWithParamsToUpdate,
        },
      };

      const queryOptions = {
        'new': true,
      };

      const updateDocumentProfile = await ProfileModel.findOneAndUpdate(querySearch, queryUpdate, queryOptions);

      if(!updateDocumentProfile) throw new Error(`Error al actualizar : ${linkedinUrl}`);

      return updateDocumentProfile;
    } catch (error) {
      throw error;
    }
  }
  async findAndUpdateOrCreateProfile(document: ProfileType): Promise<ProfileType> {
    try {
      const { linkedinUrl, } = document;
      if(!linkedinUrl) throw new Error('Linkedin url no se ha determinado');

      const existProfile = await this.validateIfExistProfile(linkedinUrl);
      if(existProfile)
        return await this.updateProfile(linkedinUrl, document);

      return await this.createDocument(document);
    } catch (error) {
      throw error;
    }
  }

  async createDocument(document: ProfileType) {
    try {
      const newDocument = await this.findAndUpdateOrCreateProfile(document);

      return newDocument;
    } catch (error) {
      throw error;
    }
  }

  async storageDocument(document: ProfileType) {
    try {
      const newDocument = await ProfileModel.create(document);

      return newDocument;
    } catch (error) {
      throw error;
    }
  }

  async storageDocumentWithSaveMethod(document: ProfileType) {
    const newDocument = new ProfileModel({ ...document, });

    // mas operaciones => race condition
    await newDocument.save();
  }

  // insertMany => 1000
  async storageMultipleDocument(documents: Array<ProfileType>) {
    try {
      await ProfileModel.insertMany(documents);
    } catch (error) {
      throw error;
    }
  }

  // bulkoperator = 100 000
  async storageMultipleDocumentWithBulkOperator(documents: Array<ProfileType>) {
    const perPage = 1000;
    const pages = documents.length / perPage;

    for (let i = 0 ; i < pages ; i++) {
      const documentsToProcess = documents.slice(i * perPage, (i + 1) * perPage);
      const operatorBulk = ProfileModel.collection.initializeUnorderedBulkOp();

      for (const document of documentsToProcess)
        operatorBulk.insert(document);

      if(operatorBulk.length)
        await operatorBulk.execute();
    }
  }

  // operaciones en serie

  async updateStorageMultipleDocuments(documents: Array<ProfileType>) {
    for (const document of documents) {
      const { linkedinUrl, } = document;
      await ProfileModel.updateOne({ linkedinUrl, }, { $set: { isActive: true, }, });
    }
  }

  // sharding set

  async updateStorageMultipleDocumentsWithBulkOperator(documents: Array<ProfileType>) {
    const bulkoperator = ProfileModel.collection.initializeUnorderedBulkOp();
    for (const document of documents) {
      const { linkedinUrl, } = document;

      const querySearch = {
        linkedinUrl,
      };
      const queryUpdate = {
        $set: {
          isActive: true,
        },
      };
      bulkoperator
        .find(querySearch)
        .updateOne(queryUpdate);
    }
    if(bulkoperator.length)
      await bulkoperator.execute();
  }
}

const ParsingController = new PARSING();

export default ParsingController;
